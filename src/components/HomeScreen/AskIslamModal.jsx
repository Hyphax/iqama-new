import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, Pressable, StyleSheet, Dimensions, Keyboard, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, withSpring, Easing } from "react-native-reanimated";
import { MessageCircle, X, Send, Sparkles, BookOpen, Heart, Star, Moon } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const { height: SH } = Dimensions.get("window");
const PERPLEXITY_API_KEY = process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || "";

const SUGGESTED_QUESTIONS = [
    { text: "What does Islam say about patience?", icon: Heart, color: "#FF6B8A" },
    { text: "How should I deal with anxiety as a Muslim?", icon: Moon, color: "#C9A0DC" },
    { text: "What are the benefits of Salah?", icon: Star, color: "#D4AF37" },
    { text: "How can I increase my Iman?", icon: BookOpen, color: "#D4AF37" },
    { text: "What is the importance of Dua?", icon: Sparkles, color: "#6C8EF5" },
    { text: "How to find peace through Quran?", icon: Heart, color: "#4CAF50" },
];

async function askPerplexity(question) {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${PERPLEXITY_API_KEY}` },
        body: JSON.stringify({
            model: "sonar",
            messages: [
                { role: "system", content: "You are IQAMA's Islamic knowledge assistant. When asked who you are, say 'I am IQAMA Islamic knowledge assistant, here to help you learn about Islam.' Answer questions about Islam with wisdom, citing relevant Quran verses and hadith when appropriate. Keep answers concise (3-5 paragraphs max), warm, and spiritually uplifting. If someone asks a non-Islamic question, gently redirect them to ask about Islam. Format your response in plain text without markdown symbols." },
                { role: "user", content: question },
            ],
            max_tokens: 600, temperature: 0.6,
        }),
    });
    if (!response.ok) throw new Error("Failed to get answer");
    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content || "Sorry, I could not find an answer right now.";
    return raw.replace(/\[\d+\]/g, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
}

function OrbitDot({ radius, duration, startDeg, size, color }) {
    const deg = useSharedValue(startDeg);
    useEffect(() => { deg.value = withRepeat(withTiming(startDeg + 360, { duration, easing: Easing.linear }), -1, false); }, []);
    const s = useAnimatedStyle(() => { const rad = (deg.value * Math.PI) / 180; return { transform: [{ translateX: Math.cos(rad) * radius }, { translateY: Math.sin(rad) * radius }] }; });
    return <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color }, s]} />;
}

function SonarRing({ delay: d, maxScale, duration, color, thickness }) {
    const sc = useSharedValue(1);
    useEffect(() => { sc.value = withDelay(d, withRepeat(withSequence(withTiming(maxScale, { duration, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 0 })), -1, false)); }, []);
    const s = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }], opacity: Math.max(0, 1 - (sc.value - 1) / (maxScale - 1)) }));
    return <Animated.View style={[{ position: "absolute", width: 58, height: 58, borderRadius: 29, borderWidth: thickness, borderColor: color }, s]} />;
}

function FloatingButton({ onPress }) {
    const insets = useSafeAreaInsets();
    const scale = useSharedValue(1);
    const breathe = useSharedValue(1);
    const outerGlow = useSharedValue(0.1);
    const shimmerX = useSharedValue(-70);
    const iconRot = useSharedValue(0);

    useEffect(() => {
        breathe.value = withRepeat(withSequence(withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.sin) }), withTiming(0.94, { duration: 2200, easing: Easing.inOut(Easing.sin) })), -1, true);
        outerGlow.value = withRepeat(withSequence(withTiming(0.5, { duration: 2500, easing: Easing.inOut(Easing.sin) }), withTiming(0.08, { duration: 2500, easing: Easing.inOut(Easing.sin) })), -1, true);
        shimmerX.value = withDelay(500, withRepeat(withSequence(withTiming(70, { duration: 1200, easing: Easing.inOut(Easing.ease) }), withDelay(3500, withTiming(-70, { duration: 0 }))), -1, false));
        iconRot.value = withDelay(1000, withRepeat(withSequence(withTiming(8, { duration: 600, easing: Easing.inOut(Easing.sin) }), withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 400, easing: Easing.inOut(Easing.sin) }), withDelay(3000, withTiming(0, { duration: 0 }))), -1, false));
    }, []);

    const scaleS = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    const breatheS = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
    const outerS = useAnimatedStyle(() => ({ opacity: outerGlow.value }));
    const shimmerS = useAnimatedStyle(() => ({ transform: [{ translateX: shimmerX.value }] }));
    const iconS = useAnimatedStyle(() => ({ transform: [{ rotate: iconRot.value + "deg" }] }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        scale.value = withSpring(0.82, { damping: 6 }, () => { scale.value = withSpring(1, { damping: 10, stiffness: 150 }); });
        onPress();
    };

    // Position above the floating tab bar: insets.bottom + tabBarHeight(72) + gap(16)
    const tabBarBottom = Platform.OS === "ios" ? Math.max(insets.bottom - 8, 12) : 12;
    const btnBottom = tabBarBottom + 72 + 12;

    return (
        <Animated.View style={[{ position: "absolute", bottom: btnBottom, right: 16, zIndex: 100, width: 80, height: 80, alignItems: "center", justifyContent: "center" }, scaleS]}>
            <SonarRing delay={0} maxScale={1.8} duration={2800} color="rgba(212,175,55,0.30)" thickness={1.5} />
            <SonarRing delay={900} maxScale={2.2} duration={3200} color="rgba(212,175,55,0.15)" thickness={1} />
            <Animated.View style={[{ position: "absolute", width: 72, height: 72, borderRadius: 36 }, outerS]}>
                <LinearGradient colors={["rgba(212,175,55,0.15)", "rgba(201,160,220,0.1)", "rgba(212,175,55,0.08)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: 36 }} />
            </Animated.View>
            <OrbitDot radius={32} duration={3500} startDeg={0} size={4} color="rgba(212,175,55,0.8)" />
            <OrbitDot radius={35} duration={4500} startDeg={120} size={3} color="rgba(212,175,55,0.7)" />
            <OrbitDot radius={33} duration={5500} startDeg={240} size={3.5} color="rgba(201,160,220,0.7)" />
            <Animated.View style={breatheS}>
                <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={{ width: 52, height: 52, borderRadius: 26, overflow: "hidden", borderWidth: 1.5, borderColor: "rgba(212,175,55,0.6)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,5,16,0.92)", shadowColor: "#D4AF37", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16 }}>
                    <LinearGradient colors={["rgba(212,175,55,0.15)", "rgba(184,134,11,0.08)", "rgba(5,5,16,0.95)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ ...StyleSheet.absoluteFillObject, borderRadius: 26 }} />
                    <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, width: 30 }, shimmerS]}>
                        <LinearGradient colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
                    </Animated.View>
                    <Animated.View style={iconS}>
                        <MessageCircle size={21} color="#D4AF37" strokeWidth={1.8} />
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
            <Text style={{ position: "absolute", bottom: -2, fontFamily: "Montserrat_600SemiBold", fontSize: 7, color: "rgba(212,175,55,0.55)", letterSpacing: 1.5 }}>ASK</Text>
        </Animated.View>
    );
}

function SuggestionCard({ item, index, onPress }) {
    const IconComp = item.icon;
    return (
        <Animated.View entering={FadeInDown.delay(200 + index * 80).duration(400).springify()}>
            <TouchableOpacity onPress={() => onPress(item.text)} activeOpacity={0.7}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, marginBottom: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <LinearGradient colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]} style={StyleSheet.absoluteFill} />
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: item.color + "12", borderWidth: 0.5, borderColor: item.color + "30", alignItems: "center", justifyContent: "center" }}>
                    <IconComp size={16} color={item.color} strokeWidth={1.5} />
                </View>
                <Text style={{ flex: 1, fontFamily: "Montserrat_400Regular", fontSize: 13.5, color: "rgba(255,255,255,0.65)", lineHeight: 19 }}>{item.text}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

function LoadingDots() {
    const d1 = useSharedValue(0.3);
    const d2 = useSharedValue(0.3);
    const d3 = useSharedValue(0.3);
    useEffect(() => {
        d1.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, true);
        d2.value = withDelay(150, withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, true));
        d3.value = withDelay(300, withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1, true));
    }, []);
    const s1 = useAnimatedStyle(() => ({ opacity: d1.value, transform: [{ scale: 0.7 + d1.value * 0.3 }] }));
    const s2 = useAnimatedStyle(() => ({ opacity: d2.value, transform: [{ scale: 0.7 + d2.value * 0.3 }] }));
    const s3 = useAnimatedStyle(() => ({ opacity: d3.value, transform: [{ scale: 0.7 + d3.value * 0.3 }] }));
    const dot = { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D4AF37" };
    return (
        <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 40 }}>
            <Animated.View style={[dot, s1]} />
            <Animated.View style={[dot, s2]} />
            <Animated.View style={[dot, s3]} />
        </View>
    );
}

export function AskIslamModal() {
    const [visible, setVisible] = useState(false);
    const [inputText, setInputText] = useState("");
    const [askedQuestion, setAskedQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [kbHeight, setKbHeight] = useState(0);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
        const s1 = Keyboard.addListener(showEvent, (e) => setKbHeight(e.endCoordinates.height));
        const s2 = Keyboard.addListener(hideEvent, () => setKbHeight(0));
        return () => { s1.remove(); s2.remove(); };
    }, []);

    const openModal = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        Keyboard.dismiss();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setVisible(false);
        setTimeout(() => { setAnswer(""); setError(""); setInputText(""); setAskedQuestion(""); }, 300);
    }, []);

    const handleAsk = useCallback(async (q) => {
        const trimmed = (q || inputText).trim();
        if (!trimmed || loading) return;
        Keyboard.dismiss();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true); setAnswer(""); setError("");
        setAskedQuestion(trimmed);
        setInputText("");
        try {
            const result = await askPerplexity(trimmed);
            setAnswer(result);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            setError("Could not get an answer. Please try again.");
        } finally { setLoading(false); }
    }, [inputText, loading]);

    const handleSuggestion = useCallback((q) => { setInputText(""); handleAsk(q); }, [handleAsk]);
    const resetChat = useCallback(() => { setAnswer(""); setInputText(""); setAskedQuestion(""); setError(""); }, []);

    const SHEET_HEIGHT = SH * 0.82;

    if (!visible) return <FloatingButton onPress={openModal} />;

    return (
        <>
            <FloatingButton onPress={openModal} />
            <Modal visible={true} transparent animationType="fade" statusBarTranslucent onRequestClose={closeModal}>
                <View style={{ flex: 1 }}>
                    {/* Dark backdrop - tap to close */}
                    <Pressable onPress={closeModal} style={StyleSheet.absoluteFill}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.65)" }]} />
                    </Pressable>

                    {/* Bottom sheet - moves up with keyboard */}
                    <View style={{ position: "absolute", left: 0, right: 0, bottom: kbHeight, height: SHEET_HEIGHT, backgroundColor: "#0A0A28", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" }}>
                        <LinearGradient colors={["#0E0E35", "#0A0A28", "#070718"]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />

                        {/* Drag handle */}
                        <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 6 }}>
                            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)" }} />
                        </View>

                        {/* Header */}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.06)" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(212,175,55,0.25)" }}>
                                    <LinearGradient colors={["rgba(212,175,55,0.12)", "rgba(184,134,11,0.06)"]} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                        <Sparkles size={17} color="#D4AF37" strokeWidth={1.5} />
                                    </LinearGradient>
                                </View>
                                <View>
                                    <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: "#FFF" }}>Ask About Islam</Text>
                                    <Text style={{ fontFamily: "Montserrat_300Light", fontSize: 10, color: "rgba(212,175,55,0.4)", marginTop: 2, letterSpacing: 0.5 }}>AI-Powered Islamic Knowledge</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" }}>
                                <X size={15} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 10 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                            {!answer && !loading && !error && (
                                <View>
                                    <Animated.View entering={FadeIn.duration(400)} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 }}>
                                        <LinearGradient colors={["rgba(212,175,55,0.3)", "transparent"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ height: 1, flex: 1 }} />
                                        <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 10, color: "rgba(212,175,55,0.45)", letterSpacing: 2 }}>EXPLORE</Text>
                                        <LinearGradient colors={["transparent", "rgba(212,175,55,0.3)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ height: 1, flex: 1 }} />
                                    </Animated.View>
                                    {SUGGESTED_QUESTIONS.map((item, i) => (
                                        <SuggestionCard key={i} item={item} index={i} onPress={handleSuggestion} />
                                    ))}
                                </View>
                            )}

                            {loading && (
                                <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: "center", paddingVertical: 40 }}>
                                    <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(212,175,55,0.06)", borderWidth: 1, borderColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                                        <Sparkles size={28} color="#D4AF37" strokeWidth={1.2} />
                                    </View>
                                    <LoadingDots />
                                    <Text style={{ fontFamily: "Montserrat_300Light", fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Seeking wisdom...</Text>
                                </Animated.View>
                            )}

                            {answer && !loading && (
                                <Animated.View entering={FadeIn.duration(500)}>
                                    <View style={{ borderRadius: 18, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(212,175,55,0.12)", marginBottom: 16 }}>
                                        <LinearGradient colors={["rgba(212,175,55,0.06)", "rgba(184,134,11,0.02)"]} style={{ padding: 16 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                                <MessageCircle size={12} color="rgba(212,175,55,0.5)" strokeWidth={1.5} />
                                                <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 10, color: "rgba(212,175,55,0.5)", letterSpacing: 1.5 }}>YOUR QUESTION</Text>
                                            </View>
                                            <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 21 }}>{askedQuestion}</Text>
                                        </LinearGradient>
                                    </View>
                                    <View style={{ borderRadius: 18, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.06)" }}>
                                        <LinearGradient colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]} style={{ padding: 18 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                                <Sparkles size={12} color="rgba(212,175,55,0.5)" strokeWidth={1.5} />
                                                <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 10, color: "rgba(212,175,55,0.5)", letterSpacing: 1.5 }}>ANSWER</Text>
                                            </View>
                                            <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 14.5, color: "rgba(255,255,255,0.82)", lineHeight: 25 }}>{answer}</Text>
                                        </LinearGradient>
                                    </View>
                                    <TouchableOpacity onPress={resetChat} activeOpacity={0.7} style={{ alignSelf: "center", marginTop: 20, borderRadius: 14, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(212,175,55,0.15)" }}>
                                        <LinearGradient colors={["rgba(212,175,55,0.08)", "rgba(184,134,11,0.04)"]} style={{ paddingVertical: 11, paddingHorizontal: 26, flexDirection: "row", alignItems: "center", gap: 8 }}>
                                            <Sparkles size={14} color="#D4AF37" strokeWidth={1.5} />
                                            <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: "#D4AF37" }}>Ask Another Question</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            {error && !loading && (
                                <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: "center", paddingVertical: 30 }}>
                                    <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 14, color: "rgba(255,76,110,0.8)", textAlign: "center", marginBottom: 16 }}>{error}</Text>
                                    <TouchableOpacity onPress={() => handleAsk(askedQuestion)} activeOpacity={0.7} style={{ borderRadius: 14, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(212,175,55,0.15)" }}>
                                        <LinearGradient colors={["rgba(212,175,55,0.08)", "rgba(184,134,11,0.04)"]} style={{ paddingVertical: 11, paddingHorizontal: 24 }}>
                                            <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: "#D4AF37" }}>Try Again</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </ScrollView>

                        {/* Input Row */}
                        <View style={{ borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.06)", backgroundColor: "#0A0A28" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, paddingBottom: insets.bottom + 8, gap: 10 }}>
                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 16 }}>
                                    <TextInput
                                        ref={inputRef}
                                        value={inputText}
                                        onChangeText={setInputText}
                                        placeholder="Ask anything about Islam..."
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        style={{ flex: 1, fontFamily: "Montserrat_400Regular", fontSize: 14, color: "#FFF", paddingVertical: 12 }}
                                        returnKeyType="send"
                                        onSubmitEditing={() => handleAsk()}
                                        editable={!loading}
                                    />
                                </View>
                                <TouchableOpacity onPress={() => handleAsk()} disabled={loading || !inputText.trim()} activeOpacity={0.7} style={{ width: 46, height: 46, borderRadius: 23, overflow: "hidden" }}>
                                    <LinearGradient colors={inputText.trim() && !loading ? ["#D4AF37", "#B8860B"] : ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.03)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 23 }}>
                                        <Send size={18} color={inputText.trim() && !loading ? "#050510" : "rgba(255,255,255,0.15)"} strokeWidth={2} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
