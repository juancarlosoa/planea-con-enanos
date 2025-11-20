using PCE.Shared.Abstractions.Persistence;

namespace PCE.Shared.Pagination;

public class PagedResult<T> : IPagedResult<T>
{
    public IEnumerable<T> Items { get; }
    public int TotalCount { get; }
    public int Page { get; }
    public int PageSize { get; }

    public PagedResult(IEnumerable<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }
}