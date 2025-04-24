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
  Modal,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

type StressData = number[];

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <View style={styles.startContainer}>
      <View style={styles.startContent}>
        <Text style={styles.startTitle}>Welcome to CalmPulse</Text>
        <Text style={styles.startSubtitle}>
          Your Personal Stress Management Assistant
        </Text>

        <View style={styles.iconContainer}>
          <FontAwesome6
            name="heart-pulse"
            size={80}
            color="#4caf50"
            style={styles.startIcon}
          />
        </View>

        <Text style={styles.startDescription}>
          Monitor your stress levels, heart rate variability, and body
          temperature in real-time. Get personalized recommendations for better
          health management.
        </Text>

        <TouchableOpacity style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start Monitoring</Text>
          <FontAwesome6
            name="arrow-right"
            size={20}
            color="#fff"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [stressData, setStressData] = useState<StressData>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [currentStress, setCurrentStress] = useState<number>(0);
  const [bodyTemperature, setBodyTemperature] = useState<number>(36.5);
  const [hrvValue, setHrvValue] = useState<number>(50);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [tempAnimation] = useState(new Animated.Value(36.5));
  const [hrvAnimation] = useState(new Animated.Value(50));
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [monitoringInterval, setMonitoringInterval] =
    useState<NodeJS.Timeout | null>(null);

  const startMonitoring = () => {
    if (!isConnected) {
      alert("Please connect to device first");
      return;
    }

    const interval = setInterval(() => {
      const newStressValue = Math.floor(Math.random() * 100);
      const newTempValue = 36 + Math.random() * 1.5;
      const newHrvValue = 20 + Math.floor(Math.random() * 180);

      setCurrentStress(newStressValue);
      setBodyTemperature(newTempValue);
      setHrvValue(newHrvValue);
      setStressData((prevData) => [...prevData.slice(-9), newStressValue]);

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
        Animated.timing(hrvAnimation, {
          toValue: newHrvValue,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }, 2000);

    setMonitoringInterval(interval);
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
    setIsMonitoring(false);
  };

  useEffect(() => {
    return () => {
      if (monitoringInterval) clearInterval(monitoringInterval);
    };
  }, [monitoringInterval]);

  const connectToDevice = () => setIsConnected(true);

  const calculateOverallStress = (): number => {
    const stressScore = currentStress;

    let tempScore = 0;
    if (bodyTemperature < 36.0) {
      tempScore = ((36.0 - bodyTemperature) / 2.0) * 100;
    } else if (bodyTemperature > 37.5) {
      tempScore = ((bodyTemperature - 37.5) / 2.5) * 100;
    }
    tempScore = Math.min(100, tempScore);

    let hrvScore = 0;
    if (hrvValue < 30) hrvScore = ((30 - hrvValue) / 30) * 100;
    hrvScore = Math.min(100, hrvScore);

    return stressScore * 0.6 + tempScore * 0.2 + hrvScore * 0.2;
  };

  const getStressColor = (value: number) => {
    if (value > 70) return "#ff5252";
    if (value > 40) return "#ffa726";
    return "#4caf50";
  };

  const getAnalysis = () => {
    const overallStress = calculateOverallStress();
    const stressStatus =
      overallStress > 70 ? "High" : overallStress > 40 ? "Moderate" : "Normal";

    return {
      title: "Comprehensive Stress Analysis",
      status: stressStatus,
      details: `Based on your current biometric readings:
- Stress Level: ${currentStress}%
- Body Temperature: ${bodyTemperature.toFixed(1)}°C
- HRV: ${hrvValue}ms

Composite Stress Score: ${overallStress.toFixed(1)}%`,
      recommendations:
        overallStress > 70
          ? [
              "• Immediate breathing exercises",
              "• Cool environment relaxation",
              "• Guided meditation session",
              "• Hydration check",
            ]
          : overallStress > 40
          ? [
              "• Progressive muscle relaxation",
              "• Light physical activity",
              "• Mindfulness practice",
              "• Hydration and nutrition check",
            ]
          : [
              "• Maintain healthy routines",
              "• Light exercise",
              "• Regular mindfulness practice",
            ],
      metrics: {
        stress: currentStress,
        temp: bodyTemperature,
        hrv: hrvValue,
      },
    };
  };

  const AnalysisModal = () => {
    const analysis = getAnalysis();

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAnalysis}
        onRequestClose={() => setShowAnalysis(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{analysis.title}</Text>
              <TouchableOpacity
                onPress={() => setShowAnalysis(false)}
                style={styles.closeButton}
              >
                <FontAwesome6 name="xmark" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.analysisScrollView}>
              <View style={styles.analysisContainer}>
                <Text style={styles.statusText}>
                  Status:{" "}
                  <Text
                    style={{ color: getStressColor(analysis.metrics.stress) }}
                  >
                    {analysis.status}
                  </Text>
                </Text>

                <Text style={styles.detailsText}>{analysis.details}</Text>

                <View style={styles.metricsSummary}>
                  <View style={styles.metricSummaryItem}>
                    <Text style={styles.metricSummaryValue}>
                      {analysis.metrics.stress}%
                    </Text>
                    <Text style={styles.metricSummaryLabel}>Stress</Text>
                  </View>
                  <View style={styles.metricSummaryItem}>
                    <Text
                      style={[
                        styles.metricSummaryValue,
                        {
                          color:
                            bodyTemperature > 37.5
                              ? "#ff5252"
                              : bodyTemperature < 36
                              ? "#2196f3"
                              : "#4caf50",
                        },
                      ]}
                    >
                      {analysis.metrics.temp.toFixed(1)}°C
                    </Text>
                    <Text style={styles.metricSummaryLabel}>Temperature</Text>
                  </View>
                  <View style={styles.metricSummaryItem}>
                    <Text
                      style={[
                        styles.metricSummaryValue,
                        {
                          color:
                            hrvValue < 30
                              ? "#ff5252"
                              : hrvValue > 150
                              ? "#2196f3"
                              : "#4caf50",
                        },
                      ]}
                    >
                      {analysis.metrics.hrv}ms
                    </Text>
                    <Text style={styles.metricSummaryLabel}>HRV</Text>
                  </View>
                </View>

                <Text style={styles.recommendationTitle}>
                  Recommended Actions:
                </Text>
                {analysis.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <FontAwesome6
                      name="circle-check"
                      size={16}
                      color="#4caf50"
                    />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (!isStarted) return <StartScreen onStart={() => setIsStarted(true)} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CalmPulse - Stress Tracker</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isConnected ? "Connected" : "Connect Device"}
          onPress={connectToDevice}
          color="#4caf50"
        />
      </View>

      <View style={styles.dashboard}>
        <View style={styles.monitoringControls}>
          <TouchableOpacity
            style={[
              styles.monitoringButton,
              { backgroundColor: isMonitoring ? "#666" : "#4caf50" },
            ]}
            onPress={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={!isConnected}
          >
            <FontAwesome6
              name={isMonitoring ? "stop" : "play"}
              size={16}
              color="#fff"
              style={styles.monitoringIcon}
            />
            <Text style={styles.monitoringButtonText}>
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setShowAnalysis(true)}
          style={styles.progressContainer}
        >
          <AnimatedCircularProgress
            size={200}
            width={20}
            fill={currentStress}
            tintColor={getStressColor(currentStress)}
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
        </TouchableOpacity>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={((bodyTemperature - 35) / (40 - 35)) * 100}
              tintColor="#4caf50"
              backgroundColor="#e0e0e0"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.smallProgressContent}>
                  <Text style={styles.smallPercentText}>
                    {`${bodyTemperature.toFixed(1)}°C`}
                  </Text>
                  <FontAwesome6
                    name="temperature-three-quarters"
                    size={24}
                    color="#4caf50"
                    style={styles.iconStyle}
                  />
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          <View style={styles.metricItem}>
            <AnimatedCircularProgress
              size={100}
              width={10}
              fill={((hrvValue - 20) / (200 - 20)) * 100}
              tintColor="#4caf50"
              backgroundColor="#e0e0e0"
              rotation={0}
              lineCap="round"
            >
              {(fill) => (
                <View style={styles.smallProgressContent}>
                  <Text style={styles.smallPercentText}>{`${hrvValue}ms`}</Text>
                  <FontAwesome6
                    name="heart-pulse"
                    size={24}
                    color="#4caf50"
                    style={styles.iconStyle}
                  />
                </View>
              )}
            </AnimatedCircularProgress>
          </View>
        </View>
      </View>

      <AnalysisModal />
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 20,
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
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    fontSize: 16,
  },
  iconStyle: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  analysisContainer: {
    marginTop: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  detailsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 24,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  metricsSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  metricSummaryItem: {
    alignItems: "center",
    padding: 10,
  },
  metricSummaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  metricSummaryLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  startContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  startContent: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  startTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  startSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#f8f9fa",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  startIcon: {
    marginBottom: 5,
  },
  startDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: "#4caf50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  arrowIcon: {
    marginLeft: 10,
  },
  monitoringControls: {
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  monitoringButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  monitoringButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  monitoringIcon: {
    marginRight: 5,
  },
  analysisScrollView: {
    maxHeight: "80%",
  },
});

export default App;
