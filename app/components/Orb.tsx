import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withOneOf,
  Easing,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.55;

// Reference Colors
// baseColor1: #9C43FE (Purple) -> rgb(156, 67, 254)
// baseColor2: #4CC2E9 (Light Blue) -> rgb(76, 194, 233)
// baseColor3: #101499 (Dark Blue) -> rgb(16, 20, 153)

export default function Orb({ active = true }: { active?: boolean }) {
  const rotation = useSharedValue(0);
  const breath = useSharedValue(0);
  const turbulence = useSharedValue(0);

  useEffect(() => {
    // Continuous rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Breathing / Pulse
    breath.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (active) {
       turbulence.value = withRepeat(
         withTiming(1, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
         -1, 
         true
       );
    } else {
       turbulence.value = withTiming(0);
    }
  }, [active]);

  const containerStyle = useAnimatedStyle(() => {
    const scale = interpolate(breath.value, [0, 1], [0.95, 1.05]);
    const activeScale = interpolate(turbulence.value, [0, 1], [1, 1.02]);
    
    return {
      transform: [
        { scale: scale * activeScale },
      ],
    };
  });

  const coreStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  
  const glowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(breath.value, [0, 1], [0.5, 0.8]);
    const activeOpacity = interpolate(turbulence.value, [0, 1], [0, 0.2]);
    return {
      opacity: opacity + activeOpacity,
      transform: [{ rotate: `-${rotation.value * 0.5}deg` }]
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wrapper, containerStyle]}>
        
        {/* Outer Glow / Halo */}
        <Animated.View style={[styles.layer, styles.glowContainer, glowStyle]}>
           <LinearGradient
              colors={['rgba(76, 194, 233, 0.0)', 'rgba(156, 67, 254, 0.4)', 'rgba(76, 194, 233, 0.0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
           />
        </Animated.View>

        {/* Core Orb */}
        <Animated.View style={[styles.layer, styles.coreContainer, coreStyle]}>
            <LinearGradient
              colors={['#101499', '#9C43FE', '#4CC2E9']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              style={styles.gradient}
            />
             {/* Inner Highlight to simulate 3D sphere */}
             <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={[styles.gradient, styles.highlight]}
             />
        </Animated.View>
        
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 320,
    width: 320,
  },
  wrapper: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
    borderRadius: 999,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  coreContainer: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    overflow: 'hidden',
    shadowColor: '#9C43FE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  glowContainer: {
    width: ORB_SIZE * 1.6,
    height: ORB_SIZE * 1.6,
    opacity: 0.6,
  },
  highlight: {
    position: 'absolute',
    top: 5,
    left: 10,
    width: '60%',
    height: '60%',
  }
});
