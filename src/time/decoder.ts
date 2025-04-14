export class DateDecoderError extends Error {
    public constructor(value: string) {
        super(`Failed to decode '${value}' into JS-Date`);
    }
}

export const dateDecoder = (value: string): Date => {
    const date = new Date(value);
    if (isNaN(date.valueOf())) {
        throw new DateDecoderError(value);
    }

    return date;
};
