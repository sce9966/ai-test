import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRandomUid } from '../../common/utils/createRandomUid';
import { removeSpecialCharacters } from '../../common/utils/removeSpecialCharacters';
import type { TenantCosConfig } from '../../config/tenantCosConfig';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const COS = require('cos-nodejs-sdk-v5') as new (options: {
  SecretId: string;
  SecretKey: string;
  FileParallelLimit?: number;
}) => {
  putObject: (
    params: Record<string, unknown>,
    callback: (err: Error | null, data: { Location: string }) => void,
  ) => void;
};

/**
 * 上传文件原始结构。
 */
export interface UploadFileInput {
  filename?: string;
  originalname: string;
  buffer: Buffer;
  mimetype?: string;
  size?: number;
  dir?: string;
}

/**
 * COS 上传结果。
 */
export interface UploadFileResult {
  url: string;
  name: string;
  type: string;
  size?: number;
}

type CosClient = InstanceType<typeof COS>;

/**
 * 文件上传服务（腾讯云 COS）。
 */
@Injectable()
export class UploadService {
  private tencentCos: CosClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * 上传文件入口。
   *
   * @param file multer 文件对象
   */
  async uploadFile(file: UploadFileInput): Promise<UploadFileResult> {
    const {
      filename: name,
      originalname,
      buffer,
      dir = process.env.NAMESPACE || 'openkey',
      mimetype,
      size,
    } = file;
    const fileType = mimetype ? mimetype.split('/')[1] : '';
    const filename = Buffer.from(originalname, 'latin1').toString('utf8') || name || '';
    Logger.debug(`准备上传文件: ${filename}, 类型: ${fileType}`, 'UploadService');
    try {
      return await this.uploadFileByTencentCos({
        filename,
        buffer,
        dir,
        fileType,
        size,
      });
    } catch (error) {
      Logger.error(
        `上传失败: ${error instanceof Error ? error.message : String(error)}`,
        'UploadService',
      );
      throw error;
    }
  }

  /**
   * 通过腾讯云 COS 上传对象。
   *
   * @param params 上传参数
   */
  async uploadFileByTencentCos(params: {
    filename: string;
    buffer: Buffer;
    dir: string;
    fileType: string;
    size?: number;
  }): Promise<UploadFileResult> {
    const { filename, buffer, dir, fileType, size } = params;
    const { cosBucket, cosRegion, cosSecretId, cosSecretKey, tencentCosAcceleratedDomain } =
      this.getUploadConfig();

    this.tencentCos = new COS({
      SecretId: cosSecretId,
      SecretKey: cosSecretKey,
      FileParallelLimit: 10,
    });

    try {
      return await new Promise((resolve, reject) => {
        if (!this.tencentCos) {
          reject(new HttpException('COS 客户端未初始化', HttpStatus.BAD_REQUEST));
          return;
        }
        this.tencentCos.putObject(
          {
            Bucket: removeSpecialCharacters(cosBucket),
            Region: removeSpecialCharacters(cosRegion),
            Key: `${dir}/${filename || `${createRandomUid()}.${fileType}`}`,
            // StorageClass: 'STANDARD',
            Body: buffer,
          },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            let locationUrl = String(data.Location).replace(
              /^(http:\/\/|https:\/\/|\/\/|)(.*)/,
              'https://$2',
            );
            if (tencentCosAcceleratedDomain) {
              locationUrl = locationUrl.replace(
                /^(https:\/\/[^/]+)(\/.*)$/,
                `https://${tencentCosAcceleratedDomain}$2`,
              );
            }
            resolve({
              url: locationUrl,
              name: filename,
              type: fileType,
              size,
            });
          },
        );
      });
    } catch (error) {
      Logger.error(error, 'UploadService');
      throw new HttpException('上传图片失败[ten]', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 读取并校验腾讯云 COS 配置。
   */
  getUploadConfig(): TenantCosConfig {
    const config = this.configService.get<TenantCosConfig>('tenantCos');
    if (
      !config?.cosBucket ||
      !config.cosRegion ||
      !config.cosSecretId ||
      !config.cosSecretKey
    ) {
      throw new HttpException('请配置正确的腾讯COS上传配置！', HttpStatus.BAD_REQUEST);
    }
    return {
      cosBucket: config.cosBucket,
      cosRegion: config.cosRegion,
      cosSecretId: config.cosSecretId,
      cosSecretKey: config.cosSecretKey,
      tencentCosAcceleratedDomain: config.tencentCosAcceleratedDomain || '',
    };
  }
}
