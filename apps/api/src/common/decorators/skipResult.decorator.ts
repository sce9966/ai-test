import { SetMetadata } from '@nestjs/common';

/** 跳过统一 Result 包装的 metadata 键。 */
export const SKIP_RESULT_KEY = 'skipResult';

/**
 * 跳过 {@link ResultInterceptor}，用于微信回调等需返回原始 XML / 明文的接口。
 */
export const SkipResult = () => SetMetadata(SKIP_RESULT_KEY, true);
