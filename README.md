## JNI Frida Hook

Here is a quick script to easily have an overview of JNI called by a function.
It also provide a way to easily hook them

## Requirements

```
pip install frida-tools --user
npm install frida-compile -g
npm install frida-compile
```

## Usage

Fill library name and function name in `agent.js`

```javascript
library_name = "" // ex: libsqlite.so
function_name = "" // ex: JNI_OnLoad
```

Add the functions you want to hook or simply hook all in the `hook_jni` function

```javascript
 /*
    Here you can choose which function to hook
    Either you hook all to have an overview of the function called
*/
    
jni.hook_all(jnienv_addr)

/*
Either you hook the one you want by precising what to do with it
*/

Interceptor.attach(jni.getJNIFunctionAdress(jnienv_addr,"FindClass"),{
    onEnter: function(args){
        console.log("env->FindClass(\"" + Memory.readCString(args[1]) + "\")")
    }
})
```

Once you've filled all the previous informations, compile it with :

```
frida-compile agent.js -o _agent.js
```

And launch it :

```
frida -U -l _agent.js --no-pause -f <your package_name>
```

# Example of usage

[https://www.aperikube.fr/docs/aperictf_2019/my_backdoored_gallery/](https://www.aperikube.fr/docs/aperictf_2019/my_backdoored_gallery/)

# Contact

Feel free to contact me on Twitter : [Areizen](https://twitter.com/Areizen_)

or by email at : <romain.kraft@protonmail.com>
