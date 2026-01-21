export class SuccessResponseDto<T = any> {
  constructor(
    public message: string,
    public data?: T,
  ) {}
}

export class MessageOnlyResponseDto {
  constructor(public message: string) {}
}
