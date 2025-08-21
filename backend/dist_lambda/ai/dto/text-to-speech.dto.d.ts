export declare enum VoiceType {
    ALLOY = "alloy",
    ECHO = "echo",
    FABLE = "fable",
    ONYX = "onyx",
    NOVA = "nova",
    SHIMMER = "shimmer"
}
export declare enum ResponseFormat {
    MP3 = "mp3",
    OPUS = "opus",
    AAC = "aac",
    FLAC = "flac"
}
export declare class TextToSpeechDto {
    text: string;
    voice?: VoiceType;
    responseFormat?: ResponseFormat;
    speed?: number;
    model?: string;
}
