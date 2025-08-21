export declare enum ResponseType {
    GENERAL = "general",
    EDUCATIONAL = "educational",
    CODE = "code",
    CREATIVE = "creative",
    ANALYTICAL = "analytical",
    STEP_BY_STEP = "step-by-step",
    FUN = "fun"
}
export declare class GenerateResponseDto {
    content: string;
    responseType?: ResponseType;
    context?: string;
    tone?: string;
    maxLength?: string;
}
