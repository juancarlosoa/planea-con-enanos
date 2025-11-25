FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY planea-con-enanos.sln ./
COPY PCE.Modules/PCE.Modules.csproj PCE.Modules/
COPY PCE.Shared/PCE.Shared.csproj PCE.Shared/

RUN dotnet restore PCE.Modules/PCE.Modules.csproj

COPY PCE.Modules/. PCE.Modules/
COPY PCE.Shared/. PCE.Shared/

RUN dotnet publish PCE.Modules/PCE.Modules.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "PCE.Modules.dll"]