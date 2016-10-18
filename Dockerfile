FROM liuchong/rustup:stable
LABEL "name"="blog"
COPY Cargo.toml .
COPY Cargo.lock .
COPY deps.rs .
RUN cargo build --lib --release


COPY src src
COPY public public
EXPOSE 8000
ENTRYPOINT ["cargo","run"]
CMD ["--release"]
