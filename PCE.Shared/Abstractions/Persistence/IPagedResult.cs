namespace PCE.Shared.Abstractions.Persistence;

public interface IPagedResult<T>
{
    IEnumerable<T> Items { get; }
    int TotalCount { get; }
    int Page { get; }
    int PageSize { get; }
}