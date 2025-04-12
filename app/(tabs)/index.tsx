import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

type StressData = number[];

const App: React.FC = () => {
  const [stressData, setStressData] = useState<StressData>([]);
  const [stressLevel, setStressLevel] = useState<string>("Normal");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentStress, setCurrentStress] = useState<number>(0);
  const [bodyTemperature, setBodyTemperature] = useState<number>(36.5);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [tempAnimation] = useState(new Animated.Value(36.5));
  const [heartAnimation] = useState(new Animated.Value(75));

  // Simulated data generation
  useEffect(() => {
    const interval = setInterval(() => {
      const newStressValue = Math.floor(Math.random() * 100);
      const newTempValue = 36 + Math.random() * 1.5;
      const newHeartRate = 60 + Math.floor(Math.random() * 40);

      setCurrentStress(newStressValue);
      setBodyTemperature(newTempValue);
      setHeartRate(newHeartRate);
      setStressData((prevData) => [...prevData.slice(-9), newStressValue]);

      // Animate the progress
      Animated.parallel([
        Animated.timing(progressAnimation, {
          toValue: newStressValue,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(tempAnimation, {
          toValue: newTempValue,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(heartAnimation, {
          toValue: newHeartRate,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();

      // Classify stress levels
      if (newStressValue > 70) setStressLevel("High");
      else if (newStressValue > 40) setStressLevel("Moderate");
      else setStressLevel("Normal");
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const connectToDevice = () => {
    setIsConnected(true);
    console.log("Connected to Device");
  };

  const openRelaxationHub = () => {
    console.log("Navigate to Relaxation Hub");
    // Add navigation logic here
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case "High":
        return "#ff5252";
      case "Moderate":
        return "#ffa726";
      default:
        return "#4caf50";
    }
  };

  const getTempColor = (temp: number) => {
    if (temp > 37.5) return "#ff5252";
    if (temp < 36) return "#2196f3";
    return "#4caf50";
  };

  const getHeartRateColor = (rate: number) => {
    if (rate > 100) return "#ff5252";
    if (rate < 60) return "#2196f3";
    return "#4caf50";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CalmPulse-Smart Stress Tracker and Guide</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isConnected ? "Connected" : "Connect to Device"}
          onPress={connectToDevice}
        />
        <TouchableOpacity
          style={styles.relaxButton}
          onPress={openRelaxationHub}
        >
          <Text style={styles.relaxText}>Relaxation Hub</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dashboard}>
        <Text style={styles.stressLevel}>Stress Level: {stressLevel}</Text>
        <View style={styles.progressContainer}>
          <AnimatedCircularProgress
            size={200}
            width={20}
            fill={currentStress}
            tintColor={getStressColor(stressLevel)}
            backgroundColor="#e0e0e0"
            rotation={0}
            lineCap="round"
          >
            {(fill) => (
              <View style={styles.progressContent}>
                <Text style={styles.percentText}>{`${Math.round(fill)}%`}</Text>
                <Text style={styles.stressLabel}>Stress Level</Text>
              </View>
            )}
          </AnimatedCircularProgress>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={(bodyTemperature - 35) * 20}
              tintColor={getTempColor(bodyTemperature)}
              backgroundColor="#e0e0e0"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.smallProgressContent}>
                  <Text style={styles.smallPercentText}>{`${bodyTemperature.toFixed(1)}°C`}</Text>
                  <Text style={styles.symbolText}>🌡️</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          <View style={styles.metricItem}>
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={heartRate}
              tintColor={getHeartRateColor(heartRate)}
              backgroundColor="#e0e0e0"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.smallProgressContent}>
                  <Text style={styles.smallPercentText}>{`${Math.round(fill)}`}</Text>
                  <Text style={styles.symbolText}>❤️</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
        </View>
      </View>

      {stressLevel === "High" && (
        <Text style={styles.suggestion}>
          Suggestion: Take a break and try deep breathing or meditation.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  relaxButton: {
    backgroundColor: "#4caf50",
    borderRadius: 5,
    padding: 10,
  },
  relaxText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dashboard: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    marginBottom: 20,
    alignItems: "center",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  progressContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  stressLevel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  percentText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  stressLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  metricItem: {
    alignItems: "center",
  },
  smallProgressContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  smallPercentText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  smallLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  symbolText: {
    fontSize: 20,
    marginTop: 2,
  },
  suggestion: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginVertical: 20,
  },
  heartIconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: '100%',
    height: '100%',
  },
  pulseOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#ff5252',
  },
});

export default App;
