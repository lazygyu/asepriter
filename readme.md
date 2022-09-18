# Summary

A library for loading and rendering animations exported by Aseprite.

# Install

```shell
> yarn add asepriter
```

# Usage

# Development

## check example code

```shell
> yarn dev
```

# Todos

* [x] load the json and the image file
	* [x] parse the json data
	* [x] get frames and create separated images
	* [x] load tags into animations
* [x] draw a sprite
	* [x] get a specific sprite
* [x] draw an animation
	* [x] get an animation by a tag name
	* [x] update the frame number of the animation by time
	* [x] get the current sprite of the animation
* [ ] clone an Asepriter instance.
* [ ] share sprite images among animations that have the same data
