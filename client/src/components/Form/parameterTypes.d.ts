// TODO: stricter types
export type FormParameterValue = any;
export type FormParameterAttributes = {
    is_workflow: boolean;
    optional: boolean;
    display: Array<"radio", "checkboxes">;
    [attribute: string]: any;
};

export type FormParameterTypes =
    | "boolean"
    | "hidden"
    | "hidden_data"
    | "baseurl"
    | "integer"
    | "float"
    | "radio"
    | "color"
    | "directory_uri"
    | "text"
    | "password"
    | "select"
    | "data_column"
    | "genomebuild"
    | "data"
    | "data_collection"
    | "drill_down"
    | "group_tag"
    | "library_data"
    | "ftpfile"
    | "upload"
    | "rules"
    | "data_dialog";
