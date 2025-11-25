FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY PCE.Gateway/PCE.Gateway.csproj PCE.Gateway/
COPY planea-con-enanos.sln ./
COPY PCE.Shared/PCE.Shared.csproj PCE.Shared/

RUN dotnet restore PCE.Gateway/PCE.Gateway.csproj

COPY PCE.Gateway/. PCE.Gateway/
COPY PCE.Shared/. PCE.Shared/

RUN dotnet publish PCE.Gateway/PCE.Gateway.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "PCE.Gateway.dll"]