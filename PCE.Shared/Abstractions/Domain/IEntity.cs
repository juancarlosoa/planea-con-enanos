namespace PCE.Shared.Abstractions.Domain;

public interface IEntity
{
    public Guid Id { get; protected set; }
    public DateTime CreatedAt { get; protected set; }
    public DateTime? UpdatedAt { get; protected set; }

    public void Touch() => UpdatedAt = DateTime.UtcNow;
}