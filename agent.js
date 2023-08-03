import * as jni from "./utils/jni_struct.js";

var library_name = "" // ex: libsqlite.so
var function_name = "" // ex: JNI_OnLoad
var library_loaded = 0


// Function that will process the JNICall after calculating it from
// the jnienv pointer in args[0]
function hook_jni(library_name, function_name){
    
    // To get the list of exports
    Module.enumerateExportsSync(library_name).forEach(function(symbol){
        if(symbol.name == function_name){
            console.log("[...] Hooking : " + library_name + " -> " + function_name + " at " + symbol.address)
            
            Interceptor.attach(symbol.address,{
                onEnter: function(args){
                   
                    var jnienv_addr = 0x0
                    Java.perform(function(){
                        jnienv_addr = Java.vm.getEnv().handle.readPointer();
                    });
                        
                   
                    console.log("[+] Hooked successfully, JNIEnv base adress :" + jnienv_addr)
                    
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
                },
                onLeave: function(args){
                    // Prevent from displaying junk from other functions
                    Interceptor.detachAll()
                    console.log("[-] Detaching all interceptors")
                }
            })
        }
    })
}



if(library_name == "" || function_name == ""){
    console.log("[-] You must provide a function name and a library name to hook");
}else{


// First Step : waiting for the application to load the good library
// https://android.googlesource.com/platform/system/core/+/master/libnativeloader/native_loader.cpp#746
// 
// OpenNativeLibrary is called when you loadLibrary from Java, it then call android_dlopen_ext
Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'),{
    onEnter: function(args){
        // first arg is the path to the library loaded
        var library_path = Memory.readCString(args[0])

        if( library_path.includes(library_name)){
            console.log("[...] Loading library : " + library_path)
            library_loaded = 1
        }
    },
    onLeave: function(args){

        // if it's the library we want to hook, hooking it
        if(library_loaded ==  1){
            console.log("[+] Loaded")
            hook_jni(library_name, function_name)
            library_loaded = 0
        }
    }
})

}
