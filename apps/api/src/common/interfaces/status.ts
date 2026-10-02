/**
 * 全局状态枚举命名空间。
 */
export namespace Status {
  /**
   * 通用启用 / 禁用状态。
   */
  export enum CommonStatus {
    /** 启用 */
    Enable = 1,
    /** 禁用 */
    Disable = 0,
  }

  /**
   * 商品 SKU 上下架状态。
   */
  export enum SkuShelfStatus {
    /** 下架 */
    Off = 0,
    /** 上架 */
    On = 1,
  }
}
