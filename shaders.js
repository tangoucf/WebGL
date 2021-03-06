var VSHADER_SOURCE = 
	'attribute vec3 aPosition;\n' +
	'attribute vec3 aNormal;\n' +
	'attribute vec2 texCoordinates;\n' +
	
	'uniform mat4 modelT, viewT, projT;\n'+
	'uniform mat4 normalMatrix;\n' +
	'uniform vec3 EyePosition;\n' +
	'uniform mat4 inverseTransposeModelMatrix;\n' +

	'varying vec3 vPosition;\n' +
	'varying vec3 vNormal;\n' +
	'varying vec2 textCoord;\n' +
	'varying vec3 fragNormal;\n' +
	'varying vec3 fragViewDirection;\n' +	
	
	
	//normal map
	'uniform vec3 uLightPosition;\n' +
	'uniform int uNormalMap;\n'+
	//varyings
	//'varying vec2 vTextureCoord;\n' +
	'varying vec3 vTangentLightDir;\n' +
	'varying vec3 vTangentEyeDir;\n' +
	//'varying int vNormalMap;\n'+
	
	'void main() {\n' +
		
	'   gl_Position = projT*viewT*modelT*vec4(aPosition,1.0);\n' +
	'	fragNormal = normalize((normalMatrix*vec4(aNormal,0.0)).xyz);\n' +
	'	fragViewDirection = (modelT*vec4(aPosition,1.0)).xyz - EyePosition;\n' +
	'	textCoord = texCoordinates;\n' +
	'	vPosition = vec3(viewT*modelT*vec4(aPosition,1.0));\n' +
   	'	vNormal = normalize(vec3(viewT*normalMatrix*vec4(aNormal,0.0)));\n' +
	
	//'	vNormalMap = uNormalMap;\n'+
	'	if(uNormalMap==1) {\n'+
			'vec3 tangent;\n' +
			'vec3 binormal;\n' +
			'vec3 c1 = cross(aNormal,vec3(0.0,0.0,1.0));\n' +
			'vec3 c2 = cross(aNormal,vec3(0.0,1.0,0.0));\n' +
			'tangent = (length(c1)>length(c2)) ? c1 : c2;\n' +
			'tangent = normalize(tangent);\n' +
			 //Transformed vertex position
			'vec4 vertex = modelT * viewT * vec4(aPosition, 1.0);\n' +//mv
    		//Transformed normal position
			'vec3 normal = vec3(normalMatrix * vec4(aNormal, 1.0));\n' +
			'tangent = vec3(normalMatrix * vec4(tangent, 1.0));\n' +
			'vec3 bitangent = cross(normal, tangent);\n' +
			'    mat3 tbnMatrix = mat3(\n' +
			'    tangent.x, bitangent.x, normal.x,\n' +
			'    tangent.y, bitangent.y, normal.y,\n' +
			'    tangent.z, bitangent.z, normal.z\n' +
			');\n' +
    		//light direction, from light position to vertex
			'vec3 lightDirection = uLightPosition - vertex.xyz;\n' +
    		//eye direction, from camera position to vertex
			'vec3 eyeDirection = -vertex.xyz;\n' +
			//pass varying
			//'vTextureCoord = aVertexTextureCoords;\n' +
			'vTangentLightDir = lightDirection * tbnMatrix;\n' +
			'vTangentEyeDir = eyeDirection * tbnMatrix;\n' +
	'	}\n'+	
	'}\n';
	
	
var FSHADER_SOURCE = 
	//'#ifdef GL_ES\n' +
	'precision mediump float;\n' +
	//'#endif\n' +

	'varying vec3 vPosition;\n' +
	'varying vec3 vNormal;\n' +
	'varying vec2 textCoord;\n' +
	'varying vec3 fragNormal;\n' +
	'varying vec3 fragViewDirection;\n' +
	'uniform vec3 uEyePosition;\n' +

	'uniform int uLightType;\n' +
	'uniform int uHasTexture;\n' +
	//'uniform vec3 uEyePosition;\n' +
	'uniform vec3 uLightColor;\n' +
	'uniform vec3 uSceneAmbient;\n' +
	'uniform sampler2D texSampler;\n' +
	'uniform samplerCube texUnit;\n' +

	'uniform vec3 uEmissionColor;\n' +
	'uniform vec3 uDiffuseReflectance;\n' +
	'uniform vec3 uAmbientReflectance;\n' +
	'uniform vec3 uSpecularReflectance;\n' +
	'uniform float uShininess;\n' +
	'uniform float uSpotlightAngle;\n' +
	'uniform float uAlpha;\n' +
	
	// normal (vTextureCoord)!
	//geometry
	'uniform vec4 uMaterialDiffuse;\n' +
	'uniform vec4 uMaterialAmbient;\n' +
	'uniform vec4 uLightAmbient;\n' +
	'uniform vec4 uLightDiffuse;\n' +
	//samplers
	'uniform sampler2D uNormalSampler;\n' +
	//varying
	'uniform int uNormalMap2;\n'+
	//'varying vec4 vNormalMap;\n' +
	//'varying vec2 vTextureCoord;\n' +
	'varying vec3 vTangentLightDir;\n' +
	'varying vec3 vTangentEyeDir;\n' +
	
    'void main() {\n' +			
	//'		vec3 color = vec3(0.8,0,0);\n' +			// make models red - texturize in the future
	'	vec3 normal = normalize(vNormal);\n' +	
	// EMISSIVE REFLECTANCE:
	'	vec3 emission = uEmissionColor;\n' +
	// AMBIENT REFLECTANCE 
	//'	vec3 ambience = uAmbientReflectance * uSceneAmbient;\n' +
	'	vec3 ambience = uSceneAmbient;\n' + 
	// DIFFUSE REFLECTANCE:
			// direction from eye (camera location) to fragment
	'	vec3 lightDirection = normalize(uEyePosition-vPosition);\n' +	
			// The dot product of the light direction and the normal
	'	float nDotL = max(dot(lightDirection,normal), 0.0);\n' +	
			// calculate diffuse reflectance
	'	vec3 diffuse = uLightColor * uDiffuseReflectance * nDotL;\n' +	
	// SPECULAR REFLECTANCE:
   			// make spotlight always hit center of the screen (vec3(0,0,0))
	'	vec3 viewDirection = normalize(-vPosition);\n' +	
			// get reflection vector
	'	vec3 reflectDirection = reflect(-lightDirection,normal);\n' +	
	  		// angle between view and reflection 
	'	float vDotR = max(dot(viewDirection, reflectDirection),0.0);\n' +	
			// calculate specular reflectance (10.0 => material.shininess; pow() restricts angle)
	'	vec3 specular = uLightColor * uSpecularReflectance * pow(vDotR, uShininess);\n' +	
			// direction from camera space; since light comes from camera
	'	vec3 spotlightDirection = vec3(0.0,0.0,-1.0);\n' +	
   			// Calculate angle between spot-light look direction and from light to
	'	float sDotF = dot(spotlightDirection,-viewDirection);\n' +	
	'	vec4 textColor = texture2D(texSampler, vec2(textCoord.s, textCoord.t));\n' +
	
	// DETERMINE LIGHT COLOR BASED ON COMPONENTS:
			// assumes omni light
	//'	vec3 tColor = vec3(emission + ambience + diffuse + specular);\n' +
	'	vec3 tColor = emission + ambience + diffuse + specular;\n' +
			// alter color if source is spotlight
	'	if(uLightType == 0) {\n' +
   				// calculate cone of spotlight
	'		float spotDifference = 0.0;\n' +
				// allow 10 degree spotlight angle
	//'			if(acos(sDotF) < radians(10.0)) {\n' +
	'		if(acos(sDotF) < radians(uSpotlightAngle)) {\n' +
					// 60.0 restricts angle; determines how spotlight fades out (domain: 0.0 - 120.0)
	'			spotDifference = pow(sDotF, 60.0);\n' +	 
	'		}\n' +
				// emmission & ambience are not restricted by spotlight
	'		tColor = vec3(emission + ambience + spotDifference * (diffuse + specular));\n' +		
	//'		tColor = vec3(emission + ambience + spotDifference * (diffuse));\n' +
	'	}\n' + 
	'	vec3 viewDir = normalize(fragViewDirection);\n' +
	'	vec3 SummataNormal = normalize(fragNormal);\n' +
	//'	vec3 reflectedViewDirection = reflect(viewDirection, normal);\n' +
	'	vec3 reflectedViewDirection = reflect(viewDir, SummataNormal);\n' +
	'	vec3 environmentColor = textureCube(texUnit, reflectedViewDirection).rgb;\n' +
	
	
	// normal map calculations
	'	vec4 bumpMapColor;\n'+
	'	if(uNormalMap2==1) {\n'+			
    		// Unpack tangent-space normal from texture
 			'normal = normalize(2.0 * (texture2D(uNormalSampler, textCoord).rgb - 0.5));\n' +
			// Normalize the light direction and determine how much light is hitting this point
  			'lightDirection = normalize(vTangentLightDir);\n' +
   			'float lambertTerm = max(dot(normal,lightDirection),0.20);\n' +
    		// Calculate Specular level
    		'vec3 eyeDirection = normalize(vTangentEyeDir);\n' +
    		'vec3 reflectDir = reflect(-lightDirection, normal);\n' +
    		'float Is = pow(clamp(dot(reflectDir, eyeDirection), 0.0, 1.0), 8.0);\n' +
    		// Combine lighting and material colors
    		'vec4 Ia = uLightAmbient * uMaterialAmbient;\n' +
    		'vec4 Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;\n' +
			//'vec4 Id = uLightDiffuse * uMaterialDiffuse * texture2D(uSampler, vTextureCoord) * lambertTerm;\n' +
			'bumpMapColor = Ia + Id + Is;\n' +			
	'	}\n' +
		
	
	'   if(uNormalMap2==1) {\n' +
	'       gl_FragColor = (uAlpha != 1.0)?vec4(environmentColor * bumpMapColor.rgb, uAlpha):vec4(textColor.rgb*bumpMapColor.rgb, 1.0);\n' +
	'	}\n' + 
	'	else if(uHasTexture == 1) {\n' +
	'		gl_FragColor = vec4(textColor.rgb*tColor, uAlpha);\n' +
	'	}\n' +
	'	else if(uHasTexture == 0 && uAlpha < 0.0) {\n' +
	'		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' +
	'	}\n' + 
	'	else\n' + 
	'	{	\n' +	  
	'		gl_FragColor = vec4(environmentColor*tColor, uAlpha);\n' +
	'	}\n' +
	' }\n';


















/*var FSHADER_SOURCE = 
	'precision mediump float;\n' +
	'varying vec3 vPosition;\n' +
	'varying vec3 vNormal;\n' +
	'varying vec2 textCoord;\n' +
	'varying vec3 fragNormal;\n' +
	'varying vec3 fragViewDirection;\n' +
	'uniform vec3 uEyePosition;\n' +
	'uniform int uLightType;\n' +
	'uniform int uHasTexture;\n' +
	'uniform vec3 uLightColor;\n' +
	'uniform vec3 uSceneAmbient;\n' +
	'uniform sampler2D texSampler;\n' +
	'uniform samplerCube texUnit;\n' +
	'uniform vec3 uEmissionColor;\n' +
	'uniform vec3 uDiffuseReflectance;\n' +
	'uniform vec3 uAmbientReflectance;\n' +
	'uniform vec3 uSpecularReflectance;\n' +
	'uniform float uShininess;\n' +
	'uniform float uSpotlightAngle;\n' +
	'uniform float uAlpha;\n' +
	'uniform vec4 uMaterialDiffuse;\n' +
	'uniform vec4 uMaterialAmbient;\n' +
	'uniform vec4 uLightAmbient;\n' +
	'uniform vec4 uLightDiffuse;\n' +
	'uniform sampler2D uNormalSampler;\n' +
	'uniform int uNormalMap2;\n'+
	'varying vec3 vTangentLightDir;\n' +
	'varying vec3 vTangentEyeDir;\n' +
    'void main() {\n' +			
	'	vec3 normal = normalize(vNormal);\n' +	
	'	vec3 emission = uEmissionColor;\n' +
	'	vec3 ambience = uSceneAmbient;\n' + 
	'	vec3 lightDirection = normalize(uEyePosition-vPosition);\n' +	
	'	float nDotL = max(dot(lightDirection,normal), 0.0);\n' +	
	'	vec3 diffuse = uLightColor * uDiffuseReflectance * nDotL;\n' +	
	'	vec3 viewDirection = normalize(-vPosition);\n' +	
	'	vec3 reflectDirection = reflect(-lightDirection,normal);\n' +	
	'	float vDotR = max(dot(viewDirection, reflectDirection),0.0);\n' +	
	'	vec3 specular = uLightColor * uSpecularReflectance * pow(vDotR, uShininess);\n' +	
	'	vec3 spotlightDirection = vec3(0.0,0.0,-1.0);\n' +	
	'	float sDotF = dot(spotlightDirection,-viewDirection);\n' +	
	'	vec4 textColor = texture2D(texSampler, vec2(textCoord.s, textCoord.t));\n' +
	'	vec3 tColor = emission + ambience + diffuse + specular;\n' +
	'	if(uLightType == 0) {\n' +
	'		float spotDifference = 0.0;\n' +
	'		if(acos(sDotF) < radians(uSpotlightAngle)) {\n' +
	'			spotDifference = pow(sDotF, 60.0);\n' +	 
	'		}\n' +
	'		tColor = vec3(emission + ambience + spotDifference * (diffuse + specular));\n' +		
	'	}\n' + 
	'	vec3 viewDir = normalize(fragViewDirection);\n' +
	'	vec3 SummataNormal = normalize(fragNormal);\n' +
	'	vec3 reflectedViewDirection = reflect(viewDir, SummataNormal);\n' +
	'	vec3 environmentColor = textureCube(texUnit, reflectedViewDirection).rgb;\n' +
	'	vec4 bumpMapColor;\n'+
	'	if(uNormalMap2==1) {\n'+			
 			'normal = normalize(2.0 * (texture2D(uNormalSampler, textCoord).rgb - 0.5));\n' +
  			'lightDirection = normalize(vTangentLightDir);\n' +
   			'float lambertTerm = max(dot(normal,lightDirection),0.20);\n' +
    		'vec3 eyeDirection = normalize(vTangentEyeDir);\n' +
    		'vec3 reflectDir = reflect(-lightDirection, normal);\n' +
    		'float Is = pow(clamp(dot(reflectDir, eyeDirection), 0.0, 1.0), 8.0);\n' +
    		'vec4 Ia = uLightAmbient * uMaterialAmbient;\n' +
			'vec4 Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;\n' +
    		//'vec4 Id = uLightDiffuse * uMaterialDiffuse * vec4(environmentColor,1.0) * lambertTerm;\n' +
			//'vec4 Id = vec4(environmentColor,1.0);\n' +
			//'Id = vec4(environ * lambertTerm, 1.0);\n' +
			'bumpMapColor = Ia + Id + Is;\n' +			
	'	}\n' +
		
	'   if(uNormalMap2==1) {\n' +
	'       gl_FragColor = (uAlpha != 1.0)?vec4(environmentColor * bumpMapColor.rgb, uAlpha):vec4(textColor.rgb*bumpMapColor.rgb, 1.0);\n' +
	'	}\n' + 
	'	else if(uHasTexture == 1) {\n' +
	'		gl_FragColor = vec4(textColor.rgb*tColor, uAlpha);\n' +
	'	}\n' +
	'	else if(uHasTexture == 0 && uAlpha < 0.0) {\n' +
	'		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' +
	'	}\n' + 
	'	else\n' + 
	'	{	\n' +	  
	'		gl_FragColor = vec4(environmentColor*tColor, uAlpha);\n' +
	'	}\n' +
	' }\n';


var VSHADER_SOURCE = 
	'attribute vec3 aPosition;\n' +
	'attribute vec3 aNormal;\n' +
	'attribute vec2 texCoordinates;\n' +
	'uniform mat4 modelT, viewT, projT;\n'+
	'uniform mat4 normalMatrix;\n' +
	'uniform vec3 EyePosition;\n' +
	'uniform mat4 inverseTransposeModelMatrix;\n' +
	'varying vec3 vPosition;\n' +
	'varying vec3 vNormal;\n' +
	'varying vec2 textCoord;\n' +
	'varying vec3 fragNormal;\n' +
	'varying vec3 fragViewDirection;\n' +	
	'uniform vec3 uLightPosition;\n' +
	'uniform int uNormalMap;\n'+
	'varying vec3 vTangentLightDir;\n' +
	'varying vec3 vTangentEyeDir;\n' +
	'void main() {\n' +
	'   gl_Position = projT*viewT*modelT*vec4(aPosition,1.0);\n' +
	'	fragNormal = normalize((normalMatrix*vec4(aNormal,0.0)).xyz);\n' +
	'	fragViewDirection = (modelT*vec4(aPosition,1.0)).xyz - EyePosition;\n' +
	'	textCoord = texCoordinates;\n' +
	'	vPosition = vec3(viewT*modelT*vec4(aPosition,1.0));\n' +
   	'	vNormal = normalize(vec3(viewT*normalMatrix*vec4(aNormal,0.0)));\n' +
	'	if(uNormalMap==1) {\n'+
			'vec3 tangent;\n' +
			'vec3 binormal;\n' +
			'vec3 c1 = cross(aNormal,vec3(0.0,0.0,1.0));\n' +
			'vec3 c2 = cross(aNormal,vec3(0.0,1.0,0.0));\n' +
			'tangent = (length(c1)>length(c2)) ? c1 : c2;\n' +
			'tangent = normalize(tangent);\n' +
			'vec4 vertex = modelT * viewT * vec4(aPosition, 1.0);\n' +//mv
			'vec3 normal = vec3(normalMatrix * vec4(aNormal, 1.0));\n' +
			'tangent = vec3(normalMatrix * vec4(tangent, 1.0));\n' +
			'vec3 bitangent = cross(normal, tangent);\n' +
			'    mat3 tbnMatrix = mat3(\n' +
			'    tangent.x, bitangent.x, normal.x,\n' +
			'    tangent.y, bitangent.y, normal.y,\n' +
			'    tangent.z, bitangent.z, normal.z\n' +
			');\n' +
			'vec3 lightDirection = uLightPosition - vertex.xyz;\n' +
			'vec3 eyeDirection = -vertex.xyz;\n' +
			'vTangentLightDir = lightDirection * tbnMatrix;\n' +
			'vTangentEyeDir = eyeDirection * tbnMatrix;\n' +
	'	}\n'+	
	'}\n';
	
	*/