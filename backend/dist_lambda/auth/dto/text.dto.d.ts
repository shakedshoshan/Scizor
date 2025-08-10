export declare enum ActionType {
    ENHANCE = "enhance",
    RESPOND = "respond",
    TRANSLATE = "translate",
    READ = "read"
}
export declare class CreateTextDto {
    user_id: string;
    action_type: ActionType;
    text: string;
}
