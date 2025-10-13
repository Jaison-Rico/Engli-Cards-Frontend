import { View, Text, TextInput, TouchableOpacity } from "react-native";
import stylesNFC from "../styles/styleNFC";
import { Picker } from '@react-native-picker/picker'; //componente para crear listas desplegables
import { Camera, Save } from 'lucide-react-native'; //import de icons

export default function NewFlashCard() {
    return (
        <View >
            <View style={stylesNFC.container}>
                <Text style={stylesNFC.titlesNFC}>NewFlashCard</Text>
            </View>
            <View style={stylesNFC.containerCreateFC}>
                <Text style={stylesNFC.subtitlesNFC}>Crear nueva tarjeta</Text>
                
                <View>
                    <Text style={stylesNFC.textsNFC}>Palabra en Inglés *</Text>
                    <TextInput
                        style={stylesNFC.inputs}
                        placeholder="ej. Apple"
                    />
                    <Text style={stylesNFC.textsNFC}>Traducción en Español *</Text>
                    <TextInput
                        style={stylesNFC.inputs}
                        placeholder="ej. Manzana"
                    />
                    <Text style={stylesNFC.textsNFC}>Seleccionar un Mazo *</Text>
                    <View style={stylesNFC.pickerContainer}>
                        <Picker
                            //selectedValue={selectedMazo}
                            style={stylesNFC.picker}
                            onValueChange={(itemValue) => setSelectedMazo(itemValue)}
                        >
                            <Picker.Item label="Elige un mazo..." value="" />
                            <Picker.Item label="Frutas" value="frutas" />
                            <Picker.Item label="Animales" value="animales" />
                            <Picker.Item label="Colores" value="colores" />
                        </Picker>
                    </View>

                    <View>
                        <Text style={stylesNFC.textsNFC}>Contenido Adicional</Text>
                        <View style={stylesNFC.containerNFCButtons}>
                            <TouchableOpacity style={stylesNFC.containerNFCButtonsContent}>
                                <Camera/>
                                <Text style={stylesNFC.textsNFC}>Añadir Imagen</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={stylesNFC.containerNFCButtons}>
                        <TouchableOpacity style={stylesNFC.buttonSaveNFC}>
                            <Save />
                            <Text style={stylesNFC.textsNFC}>Guardar Tarjeta</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </View>
        
    )
}

