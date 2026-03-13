import { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, Share as RNShare, Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart, Share2, Copy, BookOpen, Sparkles, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Animated, {
  FadeInDown, FadeIn, FadeInLeft, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay, withSpring,
  Easing,
} from "react-native-reanimated";
import { getShadow } from "@/utils/iqamaTheme";
import { useThemeColors } from "@/utils/useThemeColors";
import { ShimmerSweep } from "@/components/ShimmerSweep";
import { WhiteBackgroundArt } from "@/components/HomeScreen/WhiteBackgroundArt";

const { width: SW } = Dimensions.get("window");

const DAY_DUAS = {
  Sunday: [
    { title: "Protection", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shai'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim", translation: "In the name of Allah, with whose name nothing can harm on earth or in heaven.", reference: "Abu Dawud 5088" },
    { title: "Morning Blessing", arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", transliteration: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykan-nushur", translation: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die.", reference: "Tirmidhi 3391" },
  ],
  Monday: [
    { title: "Forgiveness", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirullaha al-'Azeem alladhi la ilaha illa Huwal-Hayyul-Qayyum wa atubu ilayh", translation: "I seek forgiveness from Allah the Almighty, the Ever-Living, the Self-Sustaining, and I repent to Him.", reference: "Abu Dawud 1517" },
  ],
  Tuesday: [
    { title: "Strength", arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", transliteration: "Hasbi-yAllahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem", translation: "Allah is sufficient for me. There is no deity except Him. Upon Him I rely.", reference: "Quran 9:129" },
    { title: "Knowledge", arabic: "رَبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidni 'ilma", translation: "My Lord, increase me in knowledge.", reference: "Quran 20:114" },
  ],
  Wednesday: [
    { title: "Acceptance", arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ", transliteration: "Rabbana taqabbal minna innaka antas-Sami'ul-'Alim", translation: "Our Lord, accept from us. Indeed, You are the All-Hearing, All-Knowing.", reference: "Quran 2:127" },
    { title: "Sayyidul Istighfar", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ", transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka...", translation: "O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant.", reference: "Bukhari 6306" },
  ],
  Thursday: [
    { title: "Glorification", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", transliteration: "SubhanAllahi wa bihamdihi, SubhanAllahil-'Azeem", translation: "Glory be to Allah and His is the praise. Glory be to Allah the Almighty.", reference: "Bukhari 6682" },
  ],
  Friday: [
    { title: "Salawat", arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ", transliteration: "Allahumma salli 'ala sayyidina Muhammad wa 'ala ali sayyidina Muhammad...", translation: "O Allah, send blessings upon our master Muhammad and his family.", reference: "Bukhari 3370" },
    { title: "Best Dua", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar", translation: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the Fire.", reference: "Quran 2:201" },
  ],
  Saturday: [
    { title: "Gratitude", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur", translation: "All praise is for Allah Who gave us life after causing us to die.", reference: "Bukhari 6312" },
  ],
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DUA_ACCENTS = {
  Protection: "#6C8EF5", "Morning Blessing": "#F5C842", Forgiveness: "#C9A0DC",
  Strength: "#FF9A5C", Knowledge: "#D4AF37", Acceptance: "#00FFAA",
  "Sayyidul Istighfar": "#D4AF37", Glorification: "#FF6B8A",
  Salawat: "#D4AF37", "Best Dua": "#D4AF37", Gratitude: "#FF9A5C",
};

// useThemeColors and ShimmerSweep are now imported from shared modules

// Heart burst particles on like
function HeartBurst({ active }) {
  if (!active) return null;
  return (
    <View style={{ position: "absolute", top: -5, left: -5 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <HeartParticle key={i} index={i} />
      ))}
    </View>
  );
}

function HeartParticle({ index }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const angle = (index / 5) * Math.PI * 2;
    const dist = 12 + Math.random() * 8;
    opacity.value = withSequence(
      withTiming(0.9, { duration: 150 }),
      withTiming(0, { duration: 500 }),
    );
    translateX.value = withTiming(Math.cos(angle) * dist, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(Math.sin(angle) * dist - 5, { duration: 500, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 400 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[{
      position: "absolute", width: 4, height: 4, borderRadius: 2,
      backgroundColor: "#FF4C6E",
    }, style]} />
  );
}

// Geometric diamond accent
function DiamondAccent({ color, delay }) {
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.3, { duration: 600 }));
    rotate.value = withDelay(delay, withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
    -1, false));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  return (
    <Animated.View style={[{
      width: 5, height: 5,
      borderWidth: 0.5, borderColor: color,
      transform: [{ rotate: "45deg" }],
    }, style]} />
  );
}


// Individual Dua Card with full animations
function DuaCard({ dua, index, accent, liked, onLike, onCopy, onShare, copied }) {
  const C = useThemeColors();
  const cardScale = useSharedValue(0.92);
  const glowOp = useSharedValue(0.03);
  const arabicOpacity = useSharedValue(0);
  const arabicTranslateY = useSharedValue(12);
  const translationOpacity = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const [heartBurst, setHeartBurst] = useState(false);

  useEffect(() => {
    cardScale.value = withDelay(200 + index * 100, withSpring(1, { damping: 14, stiffness: 80 }));
    glowOp.value = withDelay(400 + index * 100, withRepeat(withSequence(
      withTiming(0.15, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.02, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    arabicOpacity.value = withDelay(500 + index * 150, withTiming(1, { duration: 800 }));
    arabicTranslateY.value = withDelay(500 + index * 150, withSpring(0, { damping: 14, stiffness: 90 }));
    translationOpacity.value = withDelay(800 + index * 150, withTiming(1, { duration: 600 }));
  }, []);

  const cardEntrance = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOp.value }));
  const arabicStyle = useAnimatedStyle(() => ({
    opacity: arabicOpacity.value,
    transform: [{ translateY: arabicTranslateY.value }],
  }));
  const translationStyle = useAnimatedStyle(() => ({ opacity: translationOpacity.value }));
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));

  const handleLikePress = useCallback(() => {
    onLike();
    if (!liked) {
      setHeartBurst(true);
      setTimeout(() => setHeartBurst(false), 700);
    }
  }, [liked, onLike]);

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 120).duration(600).springify()}
      style={[{ paddingHorizontal: 20, marginBottom: 18 }, cardEntrance]}
    >
      <Animated.View style={scaleStyle}>
        <View style={{
          borderRadius: 26, overflow: "hidden",
          borderWidth: 0.5, borderColor: C.isWhite ? `${accent}20` : `${accent}15`,
          ...getShadow(C.isWhite, "card"),
        }}>
          <BlurView intensity={C.isWhite ? 40 : 20} tint={C.blurTint} style={{
            padding: 24, backgroundColor: C.cardBg,
          }}>
            {!C.isWhite && <ShimmerSweep color={accent} />}

            {/* Background glow orb */}
            {!C.isWhite && (
              <Animated.View style={[{
                position: "absolute", top: -25, right: -25,
                width: 120, height: 120, borderRadius: 60,
              }, glowStyle]}>
                <LinearGradient
                  colors={[accent, `${accent}40`, "transparent"]}
                  start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }}
                  style={{ flex: 1, borderRadius: 60 }}
                />
              </Animated.View>
            )}

            {/* Second glow — bottom left */}
            {!C.isWhite && (
              <Animated.View style={[{
                position: "absolute", bottom: -20, left: -20,
                width: 80, height: 80, borderRadius: 40,
              }, glowStyle]}>
                <LinearGradient
                  colors={[`${accent}30`, "transparent"]}
                  start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }}
                  style={{ flex: 1, borderRadius: 40 }}
                />
              </Animated.View>
            )}

            {/* Title pill with icon */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              alignSelf: "flex-start", marginBottom: 20,
            }}>
              <View style={{
                backgroundColor: `${accent}12`,
                borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6,
                borderWidth: 0.5, borderColor: `${accent}20`,
                flexDirection: "row", alignItems: "center", gap: 6,
              }}>
                <Star size={10} color={`${accent}80`} fill={`${accent}40`} />
                <Text style={{
                  fontFamily: "Montserrat_600SemiBold", fontSize: 10,
                  color: `${accent}90`, letterSpacing: 1.5,
                }}>
                  {dua.title.toUpperCase()}
                </Text>
              </View>
              <DiamondAccent color={`${accent}40`} delay={600 + index * 100} />
            </View>

            {/* Arabic with reveal animation */}
            <Animated.View style={arabicStyle}>
              <Text style={{
                fontFamily: "Amiri_400Regular", fontSize: 25,
                color: C.arabic, lineHeight: 46,
                textAlign: "right", marginBottom: 20,
                textShadowColor: C.isWhite ? "transparent" : `${accent}12`,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: C.isWhite ? 0 : 4,
              }}>
                {dua.arabic}
              </Text>
            </Animated.View>

            {/* Gradient divider */}
            <LinearGradient
              colors={[`${accent}00`, `${accent}30`, `${accent}00`]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ height: 1, marginBottom: 16 }}
            />

            {/* Transliteration */}
            <Animated.View style={translationStyle}>
              <Text style={{
                fontFamily: "Montserrat_400Regular", fontSize: 13,
                color: C.textTertiary, lineHeight: 22,
                fontStyle: "italic", marginBottom: 14,
              }}>
                {dua.transliteration}
              </Text>
            </Animated.View>

            {/* Translation */}
            <Animated.View style={translationStyle}>
              <Text style={{
                fontFamily: "Montserrat_300Light", fontSize: 14,
                color: C.textSecondary, lineHeight: 24, marginBottom: 20,
              }}>
                {dua.translation}
              </Text>
            </Animated.View>

            {/* Footer */}
            <View style={{
              flexDirection: "row", justifyContent: "space-between", alignItems: "center",
              paddingTop: 16,
            }}>
              {/* Reference with gradient line */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <LinearGradient
                  colors={[`${accent}40`, `${accent}00`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ width: 16, height: 1 }}
                />
                <Text style={{
                  fontFamily: "Montserrat_400Regular", fontSize: 11,
                  color: C.textMuted,
                }}>
                  {dua.reference}
                </Text>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: "row", gap: 18, alignItems: "center" }}>
                <TouchableOpacity onPress={handleLikePress} hitSlop={12} style={{ position: "relative" }}>
                  <HeartBurst active={heartBurst} />
                  <Heart size={18}
                    color={liked ? "#FF4C6E" : C.iconMuted}
                    fill={liked ? "#FF4C6E" : "none"}
                    style={liked ? {
                      shadowColor: "#FF4C6E",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5, shadowRadius: 6,
                    } : {}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onCopy} hitSlop={12}>
                  <Copy size={18} color={copied ? accent : C.iconMuted}
                    style={copied ? {
                      shadowColor: accent,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5, shadowRadius: 6,
                    } : {}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onShare} hitSlop={12}>
                  <Share2 size={18} color={C.iconMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Copied confirmation */}
            {copied && (
              <Animated.View entering={FadeInUp.duration(200)} style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                justifyContent: "flex-end", marginTop: 8,
              }}>
                <View style={{
                  width: 4, height: 4, borderRadius: 2, backgroundColor: accent,
                  shadowColor: accent, shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6, shadowRadius: 3,
                }} />
                <Text style={{
                  fontFamily: "Montserrat_300Light", fontSize: 11,
                  color: `${accent}80`,
                }}>
                  Copied to clipboard
                </Text>
              </Animated.View>
            )}
          </BlurView>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function DuaScreen() {
  const insets = useSafeAreaInsets();
  const C = useThemeColors();
  const [liked, setLiked] = useState({});
  const [copied, setCopied] = useState(null);
  const todayName = DAY_NAMES[new Date().getDay()];
  const todayDuas = DAY_DUAS[todayName] || [];
  const [refreshing, setRefreshing] = useState(false);

  const headerLineWidth = useSharedValue(0);
  const headerGlow = useSharedValue(0);
  const iconPulse = useSharedValue(1);

  useEffect(() => {
    headerLineWidth.value = withDelay(300, withSpring(28, { damping: 12, stiffness: 80 }));
    headerGlow.value = withDelay(500, withRepeat(withSequence(
      withTiming(0.12, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    iconPulse.value = withRepeat(withSequence(
      withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
  }, []);

  const lineStyle = useAnimatedStyle(() => ({ width: headerLineWidth.value }));
  const headerGlowStyle = useAnimatedStyle(() => ({ opacity: headerGlow.value }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconPulse.value }] }));

  const handleLike = useCallback((i) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((p) => ({ ...p, [i]: !p[i] }));
  }, []);

  const handleCopy = useCallback(async (dua, i) => {
    await Clipboard.setStringAsync(`${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n— ${dua.reference}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleShare = useCallback(async (dua) => {
    try { await RNShare.share({ message: `"${dua.translation}"\n\n— ${dua.reference}\n\nvia Iqama` }); } catch {}
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.isWhite ? "#F9F6F0" : "rgba(5,5,16,0.55)" }}>
      <StatusBar style={C.statusBar} />

      {/* White theme background */}
      {C.isWhite && <WhiteBackgroundArt />}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 400); }}
          tintColor="#D4AF37" />}
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: 4 }}>
          {/* Subtle glow behind header */}
          {!C.isWhite && (
            <Animated.View style={[{
              position: "absolute", top: insets.top - 10, left: 0, right: 0, height: 80,
            }, headerGlowStyle]}>
              <LinearGradient colors={["rgba(212,175,55,0.12)", "transparent"]} style={{ flex: 1 }} />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(80).duration(500)} style={{
            flexDirection: "row", alignItems: "center", gap: 10,
          }}>
            <Animated.View style={iconStyle}>
              <BookOpen size={22} color="rgba(212,175,55,0.5)" strokeWidth={1.5} />
            </Animated.View>
            <Text style={{
              fontFamily: "PlayfairDisplay_700Bold", fontSize: 34, color: C.text,
              letterSpacing: -0.5,
              textShadowColor: C.isWhite ? "transparent" : "rgba(212,175,55,0.08)",
              textShadowOffset: { width: 0, height: 0 }, textShadowRadius: C.isWhite ? 0 : 6,
            }}>
              Daily Dua
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{
            flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, marginBottom: 28,
          }}>
            <Animated.View style={[{ height: 1, overflow: "hidden" }, lineStyle]}>
              <LinearGradient
                colors={["rgba(212,175,55,0.6)", "rgba(212,175,55,0)"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
            <Text style={{
              fontFamily: "Montserrat_300Light", fontSize: 13,
              color: C.textSubtle,
            }}>
              {todayName}'s recommended duas
            </Text>
            <DiamondAccent color="rgba(212,175,55,0.3)" delay={600} />
          </Animated.View>
        </View>

        {/* Day indicator pill */}
        <Animated.View
          entering={FadeInLeft.delay(200).duration(400).springify()}
          style={{ paddingHorizontal: 20, marginBottom: 20 }}
        >
          <View style={{
            alignSelf: "flex-start", borderRadius: 16, overflow: "hidden",
            borderWidth: 0.5, borderColor: C.isWhite ? "rgba(212,175,55,0.2)" : "rgba(212,175,55,0.12)",
          }}>
            <LinearGradient
              colors={C.isWhite ? ["rgba(212,175,55,0.12)", "rgba(212,175,55,0.04)", "transparent"] : ["rgba(212,175,55,0.08)", "rgba(212,175,55,0.02)", "transparent"]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{
                flexDirection: "row", alignItems: "center", gap: 8,
                paddingHorizontal: 16, paddingVertical: 8,
              }}
            >
              <Sparkles size={12} color="rgba(212,175,55,0.6)" />
              <Text style={{
                fontFamily: "Montserrat_600SemiBold", fontSize: 11,
                color: "rgba(212,175,55,0.6)", letterSpacing: 1,
              }}>
                {todayDuas.length} {todayDuas.length === 1 ? "DUA" : "DUAS"} FOR TODAY
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Dua Cards */}
        {todayDuas.map((dua, i) => {
          const accent = DUA_ACCENTS[dua.title] || "#D4AF37";
          return (
            <DuaCard
              key={i}
              dua={dua}
              index={i}
              accent={accent}
              liked={liked[i]}
              onLike={() => handleLike(i)}
              onCopy={() => handleCopy(dua, i)}
              onShare={() => handleShare(dua)}
              copied={copied === i}
            />
          );
        })}

        {/* Bottom decorative element */}
        <Animated.View
          entering={FadeIn.delay(800).duration(600)}
          style={{ alignItems: "center", paddingVertical: 20 }}
        >
          <LinearGradient
            colors={["rgba(212,175,55,0)", "rgba(212,175,55,0.15)", "rgba(212,175,55,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ width: 80, height: 1, marginBottom: 12 }}
          />
          <Text style={{
            fontFamily: "Montserrat_300Light", fontSize: 10,
            color: C.textFaint, letterSpacing: 2,
          }}>
            ✦ BARAKALLAHU FEEKUM ✦
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}