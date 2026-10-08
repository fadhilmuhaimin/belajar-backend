# Lab C3 · image API Rekeningo (fiktif). Build dua tahap: compile di image Go, jalankan di image minimal.
# --8<-- [start:docker]
FROM golang:1.27-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
ARG VERSI=dev
RUN CGO_ENABLED=0 go build -ldflags "-X main.versi=${VERSI}" -o /api .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /api /api
ENV ALAMAT=0.0.0.0:8080
EXPOSE 8080
USER nonroot
ENTRYPOINT ["/api"]
# --8<-- [end:docker]
