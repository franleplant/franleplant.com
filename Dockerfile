FROM ubuntu:latest
LABEL "name"="blog"
COPY dist .
EXPOSE 8000
ENTRYPOINT ["./blog"]
