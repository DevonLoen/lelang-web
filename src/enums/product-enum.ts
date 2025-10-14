
export const ProductStatus = {
    DRAFT: "DRAFT",
    REQUEST: "REQUEST",
    VERIFIED: "VERIFIED",
    ON_BIDS: "ON_BIDS",
    REJECTED: "REJECTED",
    COMPLETED: "COMPLETED"
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

export const ProductCondition = {
    NEW: "NEW",
    PRELOVED: "PRELOVED",
} as const;

export type ProductCondition = typeof ProductCondition[keyof typeof ProductCondition];