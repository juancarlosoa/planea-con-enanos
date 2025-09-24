namespace EscapeRoomPlanner.Domain.Enums;

public enum MultiModalStrategy
{
    /// <summary>
    /// Usar solo un modo de transporte para toda la ruta
    /// </summary>
    SingleMode = 1,
    
    /// <summary>
    /// Permitir cambios de modo basados en distancia (ej: coche para largas distancias, caminar para cortas)
    /// </summary>
    DistanceBased = 2,
    
    /// <summary>
    /// Aparcar en zona céntrica y caminar entre escape rooms cercanos
    /// </summary>
    ParkAndWalk = 3,
    
    /// <summary>
    /// Usar transporte público para llegar a la zona y caminar localmente
    /// </summary>
    PublicTransportAndWalk = 4,
    
    /// <summary>
    /// Optimización automática que elige la mejor combinación
    /// </summary>
    Automatic = 5
}