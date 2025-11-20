namespace PCE.Shared.Primitives;

public class Result
{
    public bool IsSuccess { get; protected set; }
    public Error? Error { get; protected set; }

    protected Result() { }

    public static Result Success() => new Result { IsSuccess = true };
    public static Result Failure(string message, string code = "error") => new Result { IsSuccess = false, Error = new Error(code, message) };
}

public class Result<T> : Result
{
    public T? Value { get; private set; }

    private Result() { }

    public static Result<T> Success(T? value = default) => new Result<T> { IsSuccess = true, Value = value };
    public new static Result<T> Failure(string message, string code = "error") => new Result<T> { IsSuccess = false, Error = new Error(code, message) };
}