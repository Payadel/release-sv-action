export const DEFAULT_CHANGELOG_VERSION_REGEX =
    /[#]+[ ]+((\\[[^\\]]+\\]\\([^)]+\\))|[^ ]+)[ ]+\\([^)]+\\)/;

export const SEMANTIC_VERSION_REGEX =
    /^(0|[1-9]\d*)(\.\d+){0,2}(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
