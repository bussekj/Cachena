# Build section

podman network create --ignore cachena-network
podman build -t cachena-db-image --env MARIADB_RANDOM_ROOT_PASSWORD=1 ./database/.

# Run section!
podman run -it --rm \
    --network cachena-network \
    --hostname cachena-db \
    --name cachena-db \
    -p 3306:3306 \
    cachena-db-image:latest 
