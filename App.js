import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Maximize2, X, Plus, Camera, Check, Edit2, Trash2, Settings, Download, Upload } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 420);
const CARD_FULL_HEIGHT = CARD_WIDTH / 1.58;
const PEEK_HEIGHT = 72;

/* FULLSCREEN INGRANDITO (~15% IN PIÙ) */
const FULLSCREEN_CARD_WIDTH = Math.min(SCREEN_HEIGHT * 0.75, 540);
const FULLSCREEN_CARD_HEIGHT = FULLSCREEN_CARD_WIDTH / 1.58;

const APPLE_COLOR_PALETTES = [
  { id: 'crimson', name: 'Crimson', colors: ['#780000', '#C1121F'] },
  { id: 'deep_ocean', name: 'Deep Ocean', colors: ['#003049', '#669BBC'] },
  { id: 'sage_forest', name: 'Sage Green', colors: ['#415D43', '#709775'] },
  { id: 'imperial_yellow', name: 'Imperial Yellow', colors: ['#FCBA04', '#FCDD00'] },
  { id: 'vibrant_orange', name: 'Sunset Orange', colors: ['#EA7317', '#FF9F1C'] },
  { id: 'ruby_red', name: 'Ruby Red', colors: ['#D00000', '#E63946'] },
  { id: 'plum_purple', name: 'Royal Purple', colors: ['#6B2D5C', '#A24888'] },
  { id: 'dark_slate', name: 'Dark Slate', colors: ['#212529', '#495057'] },
  { id: 'medium_gray', name: 'Steel Gray', colors: ['#495057', '#ADB5BD'] },
  { id: 'cream_light', name: 'Off White', colors: ['#D3C8BB', '#E7E1DA'] },
  { id: 'minimal_white', name: 'Minimal White', colors: ['#E7E1DA', '#F8F9FA'] },
];

const TEXT_COLOR_OPTIONS = [
  { id: 'pure_white', hex: '#FFFFFF' },
  { id: 'pure_black', hex: '#000000' },
  ...APPLE_COLOR_PALETTES.map((pal) => ({
    id: `txt_${pal.id}`,
    hex: pal.colors[0],
  })),
];

const INITIAL_CARDS = [
  { id: '1', name: 'CSSoftware', code: '3471139248', color: ['#38546e', '#506f8d'], textColor: '#FFFFFF' },
];

const getInitials = (name) => {
  if (!name) return 'C';
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.trim().substring(0, 2).toUpperCase();
};

const BarcodeGraphic = ({ code = '', color = '#FFF', height = 52 }) => {
  const cleanCode = code.replace(/\D/g, '') || '1234567890123';
  
  const bars = [];
  for (let i = 0; i < cleanCode.length; i++) {
    const digit = parseInt(cleanCode[i], 10);
    bars.push(digit % 3 + 1);
    bars.push(1);
    bars.push((digit + 2) % 4 + 1);
    bars.push(1);
  }

  return (
    <View style={[styles.barcodeContainer, { height }]}>
      <View style={styles.barcodeBarsRow}>
        {bars.map((width, idx) => (
          <View
            key={idx}
            style={{
              width: width * 2,
              height: '100%',
              backgroundColor: idx % 2 === 0 ? color : 'transparent',
              marginRight: 1.5,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default function App() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [activeCardIndex, setActiveCardIndex] = useState(-1);
  const [fullscreenCard, setFullscreenCard] = useState(null);
  const scrollViewRef = useRef(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardNameInput, setCardNameInput] = useState('');
  const [cardCodeInput, setCardCodeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState(APPLE_COLOR_PALETTES[0].colors);
  const [selectedTextColor, setSelectedTextColor] = useState('#FFFFFF');

  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const toggleHeaderTap = (index) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    if (activeCardIndex === index) {
      setActiveCardIndex(-1);
    } else {
      setActiveCardIndex(index);
      const cardTopInList = index * PEEK_HEIGHT;
      const targetScrollY = Math.max(0, cardTopInList - (SCREEN_HEIGHT / 2) + (CARD_FULL_HEIGHT / 2));

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: targetScrollY, animated: true });
      }, 50);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCardId(null);
    setCardNameInput('');
    setCardCodeInput('');
    setSelectedColors(APPLE_COLOR_PALETTES[0].colors);
    setSelectedTextColor('#FFFFFF');
    setIsAddModalVisible(true);
  };

  const handleOpenEditModal = (card) => {
    setEditingCardId(card.id);
    setCardNameInput(card.name);
    setCardCodeInput(card.code);
    setSelectedColors(card.color);
    setSelectedTextColor(card.textColor || '#FFFFFF');
    setFullscreenCard(null);
    setIsAddModalVisible(true);
  };

  const handleSaveCard = () => {
    if (!cardNameInput.trim() || !cardCodeInput.trim()) {
      Alert.alert('Campi incompleti', 'Inserisci il nome ed il codice della carta.');
      return;
    }

    if (editingCardId) {
      setCards(cards.map(c => c.id === editingCardId ? {
        ...c,
        name: cardNameInput.trim(),
        code: cardCodeInput.trim(),
        color: selectedColors,
        textColor: selectedTextColor,
      } : c));
    } else {
      const newCard = {
        id: Date.now().toString(),
        name: cardNameInput.trim(),
        code: cardCodeInput.trim(),
        color: selectedColors,
        textColor: selectedTextColor,
      };
      if (Platform.OS !== 'web') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setCards([newCard, ...cards]);
    }

    setIsAddModalVisible(false);
    setEditingCardId(null);
  };

  const handleBarcodeScanned = ({ data }) => {
    setCardCodeInput(data);
    setIsScanning(false);
  };

  const startScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permesso Negato', 'Serve l\'accesso alla fotocamera per scansionare i codici.');
        return;
      }
    }
    setIsScanning(true);
  };

  const handleExportCards = () => {
    setIsOptionsModalVisible(false);
    try {
      const jsonString = JSON.stringify(cards, null, 2);
      
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ifidelity_backup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('Esportazione', 'Funzione pronta per l\'ambiente Web / PWA');
      }
    } catch (error) {
      Alert.alert('Errore Esportazione', error.message);
    }
  };

  const handleImportCards = () => {
    setIsOptionsModalVisible(false);
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                  setCards(importedData);
                  Alert.alert('Successo', `Caricate ${importedData.length} carte con successo!`);
                } else {
                  Alert.alert('File non valido', 'Il file selezionato non è un backup valido.');
                }
              } catch (err) {
                Alert.alert('Errore Lettura', 'Impossibile decodificare il file JSON.');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      } else {
        Alert.alert('Importazione', 'Funzione pronta per l\'ambiente Web / PWA');
      }
    } catch (error) {
      Alert.alert('Errore Importazione', error.message);
    }
  };

  const renderWatermark = (name, textColor, isFullscreen = false) => {
    return (
      <Text style={[
        isFullscreen ? styles.fullscreenWatermarkText : styles.watermarkText,
        { color: textColor }
      ]}>
        {getInitials(name)}
      </Text>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* HEADER */}
      <LinearGradient
        colors={['#2C2C2E', '#1C1C1E', '#121212']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.iconButton} onPress={() => setIsOptionsModalVisible(true)}>
          <Settings color="#A2A2A7" size={22} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitleText}>iFidelity</Text>
          <View style={styles.cardCounterBadge}>
            <Text style={styles.cardCounterText}>{cards.length}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconButtonPrimary} onPress={handleOpenAddModal}>
          <Plus color="#FFF" size={22} />
        </TouchableOpacity>
      </LinearGradient>

      {/* SFONDO E LISTA CARTE */}
      <View style={{ flex: 1, position: 'relative' }}>
        <View style={styles.backgroundWatermarkWrapper} pointerEvents="none">
          <Image
            source={require('./assets/ifidelity.png')}
            style={styles.backgroundWatermarkImage}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.cardsContainer}>
            {cards.map((item, index) => {
              const isExpanded = activeCardIndex === index;
              const textColor = item.textColor || '#FFFFFF';

              let marginTop = 0;
              if (index > 0) {
                if (activeCardIndex !== -1 && index === activeCardIndex + 1) {
                  marginTop = 20;
                } else {
                  marginTop = -(CARD_FULL_HEIGHT - PEEK_HEIGHT);
                }
              }

              return (
                <View
                  key={item.id}
                  style={[
                    styles.cardWrapper,
                    {
                      height: CARD_FULL_HEIGHT,
                      marginTop: marginTop,
                      zIndex: index + 10,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={item.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardReal}
                  >
                    <View style={styles.watermarkArea} pointerEvents="none">
                      {renderWatermark(item.name, textColor, false)}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleHeaderTap(index)}
                      style={styles.cardHeaderArea}
                    >
                      <View />
                      <Text style={[styles.brandName, { color: textColor }]}>{item.name}</Text>
                    </TouchableOpacity>

                    {isExpanded ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setFullscreenCard(item)}
                        style={styles.cardBottomSection}
                      >
                        <BarcodeGraphic code={item.code} color={textColor} height={50} />
                        
                        <View style={styles.codeRow}>
                          <Text style={[styles.codeText, { color: textColor }]}>
                            {item.code.replace(/(.{4})/g, '$1 ')}
                          </Text>
                          <Maximize2 color={textColor} size={15} style={{ opacity: 0.8 }} />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                  </LinearGradient>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* MODALE OPZIONI */}
      <Modal
        visible={isOptionsModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsOptionsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.optionsModalOverlay}
          activeOpacity={1}
          onPress={() => setIsOptionsModalVisible(false)}
        >
          <View style={styles.optionsModalContent}>
            <Text style={styles.optionsTitle}>Opzioni Carte</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleImportCards}>
              <Upload color="#007AFF" size={22} />
              <Text style={styles.optionButtonText}>Carica Carte</Text>
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionButton} onPress={handleExportCards}>
              <Download color="#007AFF" size={22} />
              <Text style={styles.optionButtonText}>Scarica Carte</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL AGGIUNTA/MODIFICA */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.addModalOverlay}
        >
          <View style={styles.addModalContainer}>
            <View style={styles.modalGrabber} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>
                {editingCardId ? 'Modifica Carta' : 'Nuova Carta'}
              </Text>
              <TouchableOpacity style={styles.closeCircle} onPress={() => setIsAddModalVisible(false)}>
                <X color="#8E8E93" size={18} />
              </TouchableOpacity>
            </View>

            {isScanning ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  onBarcodeScanned={handleBarcodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'code128', 'qr', 'upc_a'],
                  }}
                />
                
                <View style={styles.scanOverlay}>
                  <View style={styles.viewFinder}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                  </View>
                  <Text style={styles.scanText}>Inquadra il codice a barre</Text>
                  
                  <TouchableOpacity style={styles.iosCancelScanButton} onPress={() => setIsScanning(false)}>
                    <Text style={styles.iosCancelScanText}>Annulla</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <Text style={styles.sectionTitle}>Anteprima Carta</Text>
                
                <View style={styles.previewCardWrapper}>
                  <LinearGradient
                    colors={selectedColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.previewCard}
                  >
                    <View style={styles.watermarkArea} pointerEvents="none">
                      {renderWatermark(cardNameInput || 'Carta', selectedTextColor, false)}
                    </View>

                    <View style={styles.cardHeaderArea}>
                      <View />
                      <Text style={[styles.brandName, { color: selectedTextColor }]}>
                        {cardNameInput || 'NOME CARTA'}
                      </Text>
                    </View>

                    <View style={styles.cardBottomSection}>
                      <BarcodeGraphic code={cardCodeInput} color={selectedTextColor} height={46} />
                      <Text style={[styles.codeText, { textAlign: 'center', marginTop: 4, color: selectedTextColor }]}>
                        {cardCodeInput ? cardCodeInput.replace(/(.{4})/g, '$1 ') : '1234 1234 1234 1234'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Nome</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nome Negozio..."
                      placeholderTextColor="#636366"
                      value={cardNameInput}
                      onChangeText={setCardNameInput}
                    />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Codice</Text>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Codice numerico..."
                      placeholderTextColor="#636366"
                      keyboardType="numeric"
                      value={cardCodeInput}
                      onChangeText={setCardCodeInput}
                    />
                    <TouchableOpacity style={styles.cameraIconButton} onPress={startScanner}>
                      <Camera color="#007AFF" size={22} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Colore Sfondo Carta</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteList}>
                  {APPLE_COLOR_PALETTES.map((pal) => {
                    const isSelected = selectedColors[0] === pal.colors[0];
                    return (
                      <TouchableOpacity
                        key={pal.id}
                        onPress={() => setSelectedColors(pal.colors)}
                        style={[styles.paletteCircleWrapper, isSelected && styles.paletteSelected]}
                      >
                        <LinearGradient colors={pal.colors} style={styles.paletteCircle}>
                          {isSelected && <Check color="#FFF" size={14} />}
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Colore Testo & Codice</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteList}>
                  {TEXT_COLOR_OPTIONS.map((item) => {
                    const isSelected = selectedTextColor === item.hex;
                    const isLight = item.hex === '#FFFFFF' || item.hex === '#E7E1DA' || item.hex === '#FCBA04' || item.hex === '#D3C8BB';
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setSelectedTextColor(item.hex)}
                        style={[styles.paletteCircleWrapper, isSelected && styles.paletteSelected]}
                      >
                        <View style={[styles.paletteCircle, { backgroundColor: item.hex, borderWidth: 1, borderColor: '#3A3A3C' }]}>
                          {isSelected && <Check color={isLight ? '#000000' : '#FFFFFF'} size={14} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity style={styles.iosSubmitButton} onPress={handleSaveCard}>
                  <Text style={styles.iosSubmitButtonText}>
                    {editingCardId ? 'Salva Modifiche' : 'Aggiungi Carta'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* FULLSCREEN CARTA INGRANDITA */}
      <Modal
        visible={!!fullscreenCard}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenCard(null)}
      >
        {fullscreenCard && (
          <View style={styles.modalOverlay}>
            <View style={styles.fullscreenTopBar}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity
                  style={styles.actionCircleButtonLarge}
                  onPress={() => handleOpenEditModal(fullscreenCard)}
                >
                  <Edit2 color="#FFF" size={22} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionCircleButtonLarge, { backgroundColor: '#FF453A' }]}
                  onPress={() => {
                    Alert.alert('Elimina Carta', 'Vuoi davvero eliminare questa carta?', [
                      { text: 'Annulla', style: 'cancel' },
                      {
                        text: 'Elimina',
                        style: 'destructive',
                        onPress: () => {
                          setCards(cards.filter(c => c.id !== fullscreenCard.id));
                          setFullscreenCard(null);
                        }
                      }
                    ]);
                  }}
                >
                  <Trash2 color="#FFF" size={22} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.actionCircleButtonLarge} onPress={() => setFullscreenCard(null)}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setFullscreenCard(null)}
              style={styles.rotatedCardContainer}
            >
              <LinearGradient
                colors={fullscreenCard.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fullscreenCard}
              >
                <View style={styles.watermarkArea} pointerEvents="none">
                  {renderWatermark(
                    fullscreenCard.name,
                    fullscreenCard.textColor || '#FFFFFF',
                    true
                  )}
                </View>

                <View style={styles.cardHeaderArea}>
                  <View />
                  <Text style={[
                    styles.fullscreenBrand,
                    { color: fullscreenCard.textColor || '#FFFFFF' }
                  ]}>
                    {fullscreenCard.name}
                  </Text>
                </View>

                <View style={styles.cardBottomSection}>
                  <BarcodeGraphic
                    code={fullscreenCard.code}
                    color={fullscreenCard.textColor || '#FFFFFF'}
                    height={85}
                  />
                  <Text style={[
                    styles.fullscreenCode,
                    {
                      textAlign: 'center',
                      marginTop: 10,
                      color: fullscreenCard.textColor || '#FFFFFF',
                    }
                  ]}>
                    {fullscreenCard.code.replace(/(.{4})/g, '$1 ')}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      <Text style={styles.hintText}>
        {activeCardIndex !== -1
          ? `Tocca il corpo per ingrandire la carta`
          : 'Tocca + per aggiungere una carta'}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomColor: '#2C2C2E',
    borderBottomWidth: 0.5,
    zIndex: 9999,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardCounterBadge: {
    borderWidth: 1.5,
    borderColor: '#8E8E93',
    borderRadius: 7,
    width: 38,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCounterText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  iconButton: {
    padding: 9,
    backgroundColor: '#2C2C2E',
    borderRadius: 22,
  },
  iconButtonPrimary: {
    padding: 9,
    backgroundColor: '#007AFF',
    borderRadius: 22,
  },

  backgroundWatermarkWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  backgroundWatermarkImage: {
    width: SCREEN_WIDTH,
    height: 190,
    opacity: 0.12,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: SCREEN_HEIGHT * 0.2,
    alignItems: 'center',
    zIndex: 1,
  },
  cardsContainer: {
    width: CARD_WIDTH,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, y: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  cardReal: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeaderArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
    zIndex: 2,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  watermarkArea: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: '65%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  watermarkText: {
    fontSize: 105,
    fontWeight: '900',
    opacity: 0.16,
    letterSpacing: -3,
  },
  cardBottomSection: {
    zIndex: 2,
    width: '100%',
    alignItems: 'center',
  },
  barcodeContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  barcodeBarsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  codeText: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    fontWeight: '700',
  },
  hintText: {
    color: '#636366',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 12,
  },

  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModalContent: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'stretch',
  },
  optionsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  optionButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  optionDivider: {
    height: 0.5,
    backgroundColor: '#38383A',
    marginVertical: 4,
  },

  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  addModalContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 8,
    maxHeight: '92%',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  modalGrabber: {
    width: 36,
    height: 5,
    backgroundColor: '#38383A',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeCircle: {
    width: 30,
    height: 30,
    backgroundColor: '#2C2C2E',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  previewCardWrapper: {
    width: '100%',
    aspectRatio: 1.58,
    marginBottom: 18,
  },
  previewCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  formGroup: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    width: 80,
  },
  input: {
    color: '#FFF',
    fontSize: 15,
    flex: 1,
    padding: 0,
    marginLeft: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#38383A',
    marginLeft: 16,
  },
  cameraIconButton: {
    padding: 4,
  },

  paletteList: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  paletteCircleWrapper: {
    padding: 3,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paletteSelected: {
    borderColor: '#007AFF',
  },
  paletteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iosSubmitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  iosSubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  cameraContainer: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFinder: {
    width: 220,
    height: 140,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  scanText: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 18,
  },
  iosCancelScanButton: {
    marginTop: 20,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  iosCancelScanText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenTopBar: {
    position: 'absolute',
    top: 50,
    left: 25,
    right: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  actionCircleButtonLarge: {
    padding: 13,
    backgroundColor: '#2C2C2E',
    borderRadius: 30,
  },
  rotatedCardContainer: {
    width: FULLSCREEN_CARD_WIDTH,
    height: FULLSCREEN_CARD_HEIGHT,
    transform: [{ rotate: '90deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCard: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  fullscreenBrand: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fullscreenCode: {
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 3,
    fontWeight: '700',
  },
  fullscreenWatermarkText: {
    fontSize: 180,
    fontWeight: '900',
    opacity: 0.16,
    letterSpacing: -4,
  },
});