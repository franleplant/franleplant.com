# franleplant.com [![Build Status](https://travis-ci.org/franleplant/franleplant.com.svg?branch=master)](https://travis-ci.org/franleplant/franleplant.com)
My Personal page (in construction)


## Docker instructions 

> This is mostly for deployment purposes

You need to have `docker-engine` installed

```sh

// Build image
sudo docker build -t blog .

// Run it
sudo docker run -d -p 8080:8000/tcp blog
```

- `-d` : is detached
- `-p 8080:8000` maps host address `localhost:8080` to container address `{ip}:8000`

Note that the app is running in 8000 inside

## TODO
- Use nginx to try to improve performance
- Use HTTPS
- Redirect naked domain
- Blog and more sections
- Use a nice helvetica-like font
