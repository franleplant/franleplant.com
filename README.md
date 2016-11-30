# franleplant.com [![Build Status](https://travis-ci.org/franleplant/franleplant.com.svg?branch=master)](https://travis-ci.org/franleplant/franleplant.com)
My Personal page (in construction)


## Deploy docker containers to server

Requirements: docker, docker-machine, docker-compose

```sh
# Set env variables to point to aws host
eval $(docker-machine env aws-sandbox)


# build and deploy
docker-compose up --build -d


# Optionals 

# pull latests versions of all containers (time expensive)
docker-compose pull

# pull latests version of the app
docker-compose pull web

```


Building franleplant/blog
```sh
./update_image.sh
```


## TODO
- Use HTTPS
- Blog and more sections
- Use a nice helvetica-like font
