export declare enum EnhancementType {
    GENERAL = "general",
    EDUCATIONAL = "educational",
    CODE = "code",
    CREATIVE = "creative",
    ANALYTICAL = "analytical",
    STEP_BY_STEP = "step-by-step",
    FUN = "fun"
}
export declare class EnhancePromptDto {
    user_id: string;
    prompt: string;
    enhancementType?: EnhancementType;
    context?: string;
    targetAudience?: string;
}
