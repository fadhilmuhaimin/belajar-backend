# Lab 1.31 · image API Rekeningo, satu image per commit (keputusan 247).
# Build dua tahap: compile di image Go, jalankan di image minimal tanpa shell.
FROM golang:1.27-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 go build -o /api ./cmd/api

FROM gcr.io/distroless/static-debian13:nonroot
COPY --from=build /api /api
ENTRYPOINT ["/api"]
