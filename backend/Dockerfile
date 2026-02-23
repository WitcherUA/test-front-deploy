# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копіюємо csproj і відновлюємо залежності
COPY backend/MusicStreamingApi/*.csproj ./MusicStreamingApi/
RUN dotnet restore ./MusicStreamingApi/MusicStreamingApi.csproj

# Копіюємо решту коду
COPY backend/MusicStreamingApi ./MusicStreamingApi
WORKDIR /src/MusicStreamingApi

# Збираємо проект у Release
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
EXPOSE 5000

# Запускаємо API
ENTRYPOINT ["dotnet", "MusicStreamingApi.dll"]
