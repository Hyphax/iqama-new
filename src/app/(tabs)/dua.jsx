import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, Share as RNShare, Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart, Share2, Copy, BookOpen, Sparkles, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Animated, {
  FadeInDown, FadeIn, FadeInLeft, FadeInUp,
  LayoutAnimationConfig,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay, withSpring,
  Easing,
} from "react-native-reanimated";
import { getShadow } from "@/utils/iqamaTheme";
import { useThemeColors } from "@/utils/useThemeColors";
import { ShimmerSweep } from "@/components/ShimmerSweep";
import { useSkipInitialEntering } from "@/utils/useSkipInitialEntering";

const { width: SW } = Dimensions.get("window");

const DAY_DUAS = {
  Sunday: [
    { title: "Protection", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shai'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim", translation: "In the name of Allah, with whose name nothing can harm on earth or in heaven.", reference: "Abu Dawud 5088" },
    { title: "Morning Blessing", arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", transliteration: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykan-nushur", translation: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die.", reference: "Tirmidhi 3391" },
    { title: "Trust in Allah", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ", transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal", translation: "O Allah, I seek refuge in You from worry and grief, and I seek refuge in You from inability and laziness.", reference: "Bukhari 6369" },
    { title: "Guidance", arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي", transliteration: "Allahummah-dini wa saddidni", translation: "O Allah, guide me and keep me on the right path.", reference: "Muslim 2725" },
    { title: "Wellbeing", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", transliteration: "Allahumma inni as'alukal-'afiyata fid-dunya wal-akhirah", translation: "O Allah, I ask You for wellbeing in this world and the Hereafter.", reference: "Ibn Majah 3871" },
  ],
  Monday: [
    { title: "Forgiveness", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirullaha al-'Azeem alladhi la ilaha illa Huwal-Hayyul-Qayyum wa atubu ilayh", translation: "I seek forgiveness from Allah the Almighty, the Ever-Living, the Self-Sustaining, and I repent to Him.", reference: "Abu Dawud 1517" },
    { title: "Good Character", arabic: "اللَّهُمَّ اهْدِنِي لِأَحْسَنِ الْأَخْلَاقِ لَا يَهْدِي لِأَحْسَنِهَا إِلَّا أَنْتَ", transliteration: "Allahummah-dini li ahsanil-akhlaq, la yahdi li ahsaniha illa Anta", translation: "O Allah, guide me to the best of character. None can guide to the best of it except You.", reference: "Muslim 771" },
    { title: "Beneficial Knowledge", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا", transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan", translation: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.", reference: "Ibn Majah 925" },
    { title: "Steadfastness", arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", transliteration: "Ya Muqallibal-qulub, thabbit qalbi 'ala dinik", translation: "O Turner of hearts, keep my heart firm upon Your religion.", reference: "Tirmidhi 2140" },
    { title: "Contentment", arabic: "اللَّهُمَّ قَنِّعْنِي بِمَا رَزَقْتَنِي وَبَارِكْ لِي فِيهِ", transliteration: "Allahumma qanni'ni bima razaqtani wa barik li fih", translation: "O Allah, make me content with what You have provided me and bless me in it.", reference: "Al-Hakim 1/530" },
  ],
  Tuesday: [
    { title: "Strength", arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", transliteration: "Hasbi-yAllahu la ilaha illa Huwa 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem", translation: "Allah is sufficient for me. There is no deity except Him. Upon Him I rely.", reference: "Quran 9:129" },
    { title: "Knowledge", arabic: "رَبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidni 'ilma", translation: "My Lord, increase me in knowledge.", reference: "Quran 20:114" },
    { title: "Patience", arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", transliteration: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'alal-qawmil-kafirin", translation: "Our Lord, pour upon us patience, make our feet firm, and give us victory.", reference: "Quran 2:250" },
    { title: "Relief", arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa Anta, Subhanaka inni kuntu minaz-zalimin", translation: "There is no deity except You. Glory be to You. Indeed, I have been of the wrongdoers.", reference: "Quran 21:87" },
    { title: "Success", arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", transliteration: "Rabbish-rahli sadri wa yassirli amri", translation: "My Lord, expand my chest for me and ease my task for me.", reference: "Quran 20:25-26" },
  ],
  Wednesday: [
    { title: "Acceptance", arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ", transliteration: "Rabbana taqabbal minna innaka antas-Sami'ul-'Alim", translation: "Our Lord, accept from us. Indeed, You are the All-Hearing, All-Knowing.", reference: "Quran 2:127" },
    { title: "Sayyidul Istighfar", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ", transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka...", translation: "O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant.", reference: "Bukhari 6306" },
    { title: "Mercy", arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ", transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakunnanna minal-khasirin", translation: "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy upon us, we will surely be among the losers.", reference: "Quran 7:23" },
    { title: "Provision", arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ", transliteration: "Allahummak-fini bi halalika 'an haramika wa aghnini bi fadlika 'amman siwak", translation: "O Allah, suffice me with what You have made lawful over what You have made unlawful, and enrich me by Your grace over all others.", reference: "Tirmidhi 3563" },
    { title: "Light", arabic: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا وَفِي بَصَرِي نُورًا وَفِي سَمْعِي نُورًا", transliteration: "Allahummaj-'al fi qalbi nuran, wa fi basari nuran, wa fi sam'i nuran", translation: "O Allah, place light in my heart, light in my sight, and light in my hearing.", reference: "Bukhari 6316" },
  ],
  Thursday: [
    { title: "Glorification", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", transliteration: "SubhanAllahi wa bihamdihi, SubhanAllahil-'Azeem", translation: "Glory be to Allah and His is the praise. Glory be to Allah the Almighty.", reference: "Bukhari 6682" },
    { title: "Tawakkul", arabic: "تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "Tawakkaltu 'alAllah, la hawla wa la quwwata illa billah", translation: "I put my trust in Allah. There is no power and no strength except with Allah.", reference: "Abu Dawud 5095" },
    { title: "Family", arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama", translation: "Our Lord, grant us from our spouses and offspring comfort to our eyes, and make us leaders for the righteous.", reference: "Quran 25:74" },
    { title: "Ease", arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا", transliteration: "Allahumma la sahla illa ma ja'altahu sahla, wa Anta taj'alul-hazna idha shi'ta sahla", translation: "O Allah, nothing is easy except what You make easy, and You can make difficulty easy if You wish.", reference: "Ibn Hibban 974" },
    { title: "Remembrance", arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik", translation: "O Allah, help me to remember You, thank You, and worship You in the best way.", reference: "Abu Dawud 1522" },
  ],
  Friday: [
    { title: "Salawat", arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ", transliteration: "Allahumma salli 'ala sayyidina Muhammad wa 'ala ali sayyidina Muhammad...", translation: "O Allah, send blessings upon our master Muhammad and his family.", reference: "Bukhari 3370" },
    { title: "Best Dua", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar", translation: "Our Lord, give us good in this world and good in the Hereafter, and protect us from the Fire.", reference: "Quran 2:201" },
    { title: "Forgiveness for All", arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ", transliteration: "Rabbanagh-fir li wa li walidayya wa lil-mu'minina yawma yaqumul-hisab", translation: "Our Lord, forgive me and my parents and the believers on the Day the account is established.", reference: "Quran 14:41" },
    { title: "Jannah", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ", transliteration: "Allahumma inni as'alukal-Jannata wa a'udhu bika minan-Nar", translation: "O Allah, I ask You for Paradise and I seek refuge in You from the Fire.", reference: "Abu Dawud 5079" },
    { title: "Surah Al-Kahf", arabic: "اللَّهُمَّ اجْعَلْ لِي نُورًا فِي قَلْبِي وَنُورًا فِي قَبْرِي وَنُورًا بَيْنَ يَدَيَّ وَنُورًا مِنْ خَلْفِي", transliteration: "Allahummaj-'al li nuran fi qalbi, wa nuran fi qabri, wa nuran bayna yadayya, wa nuran min khalfi", translation: "O Allah, place light in my heart, light in my grave, light before me, and light behind me.", reference: "Muslim 763" },
  ],
  Saturday: [
    { title: "Gratitude", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur", translation: "All praise is for Allah Who gave us life after causing us to die.", reference: "Bukhari 6312" },
    { title: "Refuge", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ وَمِنْ قَلْبٍ لَا يَخْشَعُ وَمِنْ نَفْسٍ لَا تَشْبَعُ وَمِنْ دَعْوَةٍ لَا يُسْتَجَابُ لَهَا", transliteration: "Allahumma inni a'udhu bika min 'ilmin la yanfa', wa min qalbin la yakhsha', wa min nafsin la tashba', wa min da'watin la yustajabu laha", translation: "O Allah, I seek refuge in You from knowledge that does not benefit, a heart that does not humble, a soul that is not satisfied, and a supplication that is not answered.", reference: "Muslim 2722" },
    { title: "Health", arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي", transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari", translation: "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight.", reference: "Abu Dawud 5090" },
    { title: "Evening Peace", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illAllahu wahdahu la sharika lah", translation: "We have reached the evening and all dominion belongs to Allah. Praise is for Allah. None has the right to be worshipped except Allah alone, with no partner.", reference: "Abu Dawud 5071" },
    { title: "Barakah", arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي مَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ بِسْمِ اللَّهِ", transliteration: "Allahumma barik lana fi ma razaqtana wa qina 'adhaban-nar, Bismillah", translation: "O Allah, bless us in what You have provided for us and protect us from the punishment of the Fire.", reference: "Ibn As-Sunni 459" },
  ],
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DUA_ACCENTS = {
  Protection: "#6C8EF5", "Morning Blessing": "#F5C842", "Trust in Allah": "#8B5CF6",
  Guidance: "#00BFFF", Wellbeing: "#34D399", Forgiveness: "#C9A0DC",
  "Good Character": "#F472B6", "Beneficial Knowledge": "#FBBF24",
  Steadfastness: "#60A5FA", Contentment: "#A78BFA",
  Strength: "#FF9A5C", Knowledge: "#D4AF37", Patience: "#38BDF8",
  Relief: "#818CF8", Success: "#FB923C",
  Acceptance: "#00FFAA", "Sayyidul Istighfar": "#D4AF37", Mercy: "#F87171",
  Provision: "#4ADE80", Light: "#FACC15",
  Glorification: "#FF6B8A", Tawakkul: "#7DD3FC", Family: "#F9A8D4",
  Ease: "#86EFAC", Remembrance: "#C084FC",
  Salawat: "#D4AF37", "Best Dua": "#D4AF37", "Forgiveness for All": "#A5B4FC",
  Jannah: "#34D399", "Surah Al-Kahf": "#FCD34D",
  Gratitude: "#FF9A5C", Refuge: "#818CF8", Health: "#4ADE80",
  "Evening Peace": "#93C5FD", Barakah: "#D4AF37",
};

// useThemeColors and ShimmerSweep are now imported from shared modules

// Heart burst particles on like
function HeartBurst({ active }) {
  if (!active) return null;
  return (
    <View style={{ position: "absolute", top: -5, left: -5 }}>
      {[0, 1, 2].map((i) => (
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
    const angle = (index / 3) * Math.PI * 2;
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
      3, false));
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
    ), 3, true));
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
      style={[{ paddingHorizontal: 20, marginBottom: 18 }, cardEntrance]}
    >
      <Animated.View style={scaleStyle}>
        <View style={{
          borderRadius: 26, overflow: "hidden",
          borderWidth: 0.5, borderColor: C.isWhite ? `${accent}20` : `${accent}15`,
          ...getShadow(C.isWhite, "card"),
        }}>
          <View style={{
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
                color: C.isWhite ? "rgba(26,20,9,0.60)" : C.textTertiary, lineHeight: 22,
                fontStyle: "italic", marginBottom: 14,
              }}>
                {dua.transliteration}
              </Text>
            </Animated.View>

            {/* Translation */}
            <Animated.View style={translationStyle}>
              <Text style={{
                fontFamily: "Montserrat_300Light", fontSize: 14,
                color: C.isWhite ? "#1A1409" : C.textSecondary, lineHeight: 24, marginBottom: 20,
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
                  color: C.isWhite ? "rgba(26,20,9,0.45)" : C.textMuted,
                }}>
                  {dua.reference}
                </Text>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: "row", gap: 18, alignItems: "center" }}>
                <TouchableOpacity onPress={handleLikePress} hitSlop={12} style={{ position: "relative" }} accessibilityRole="button" accessibilityLabel={liked ? "Remove like" : "Like dua"}>
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
                <TouchableOpacity onPress={onCopy} hitSlop={12} accessibilityRole="button" accessibilityLabel="Copy dua">
                  <Copy size={18} color={copied ? accent : C.iconMuted}
                    style={copied ? {
                      shadowColor: accent,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5, shadowRadius: 6,
                    } : {}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onShare} hitSlop={12} accessibilityRole="button" accessibilityLabel="Share dua">
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
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function DuaScreen() {
  const insets = useSafeAreaInsets();
  const C = useThemeColors();
  const skipInitialEntering = useSkipInitialEntering();
  const [liked, setLiked] = useState({});
  const [copied, setCopied] = useState(null);
  const todayName = DAY_NAMES[new Date().getDay()];
  const todayDuas = useMemo(() => DAY_DUAS[todayName] || [], [todayName]);
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

  const copiedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async (dua, i) => {
    await Clipboard.setStringAsync(`${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n— ${dua.reference}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setCopied(i);
    copiedTimerRef.current = setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleShare = useCallback(async (dua) => {
    try { await RNShare.share({ message: `"${dua.translation}"\n\n— ${dua.reference}\n\nvia Iqama` }); } catch (e) { console.warn("Share failed:", e); }
  }, []);

  return (
    <LayoutAnimationConfig skipEntering={skipInitialEntering}>
      <View style={{ flex: 1, backgroundColor: C.isWhite ? "#F9F6F0" : "#050510" }}>
        <StatusBar style={C.statusBar} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 160 }}
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
    </LayoutAnimationConfig>
  );
}
