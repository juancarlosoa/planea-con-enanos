using PCE.Shared.Abstractions.Domain;

namespace PCE.Shared.Data;

public abstract class BaseEntity : IEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}