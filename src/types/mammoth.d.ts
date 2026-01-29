declare module 'mammoth' {
  interface ExtractRawTextResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }

  interface Options {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }

  function extractRawText(options: Options): Promise<ExtractRawTextResult>;

  export { extractRawText, ExtractRawTextResult, Options };
}
