import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  Button,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Modal,
  ImageBackground,
  TextInput,
  Alert,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';

type StressData = number[];
type StressLevel = "High" | "Moderate" | "Normal";

interface MetricAnalysis {
  title: string;
  value: string;
  status: string;
  color: string;
  description: string;
  recommendations: string;
}

interface AnalysisData {
  title: string;
  status?: string;
  details: string | MetricAnalysis[];
  recommendation?: string;
}

interface UserData {
  name: string;
  age: string;
}

interface HistoryEntry {
  name: string;
  timestamp: string;
  stressLevel: number;
}

const UserInputScreen: React.FC<{ onStart: (userData: UserData) => void }> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleStart = () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Error', 'Please enter both name and age');
      return;
    }
    onStart({ name, age });
  };

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

        <Text style={styles.inputLabel}>Enter Your Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [stressData, setStressData] = useState<StressData>([]);
  const [stressLevel, setStressLevel] = useState<StressLevel>("Normal");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [currentStress, setCurrentStress] = useState<number>(0);
  const [bodyTemperature, setBodyTemperature] = useState<number>(36.5);
  const [hrvValue, setHrvValue] = useState<number>(50);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [tempAnimation] = useState(new Animated.Value(36.5));
  const [hrvAnimation] = useState(new Animated.Value(50));
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [monitoringInterval, setMonitoringInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [showIPInput, setShowIPInput] = useState<boolean>(false);
  const [esp32IP, setEsp32IP] = useState<string>("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('stressHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveToHistory = async (stressLevel: number) => {
    if (!userData) return;
    
    const newEntry: HistoryEntry = {
      name: userData.name,
      timestamp: new Date().toLocaleString(),
      stressLevel,
    };

    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);

    try {
      await AsyncStorage.setItem('stressHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const handleStartMonitoring = (data: UserData) => {
    setUserData(data);
    setIsStarted(true);
  };

  // Function to connect to ESP32
  const connectToESP32 = async (ip: string) => {
    try {
      const response = await fetch(`http://${ip}/temperature`);
      if (response.ok) {
        setEsp32IP(ip);
        setIsConnected(true);
        setShowIPInput(false);
        Alert.alert("Success", "Connected to ESP32 successfully!");
      } else {
        throw new Error("Failed to connect");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to connect to ESP32. Please check the IP address and try again."
      );
      setIsConnected(false);
    }
  };

  // Modified startMonitoring function to fetch real ESP32 data
  const startMonitoring = () => {
    if (!isConnected) {
      alert("Please connect to ESP32 first");
      return;
    }

    const interval = setInterval(async () => {
      try {
        // Fetch temperature from ESP32
        const response = await fetch(`http://${esp32IP}/temperature`);
        const tempData = await response.text();
        const newTempValue = parseFloat(tempData);

        // Generate mock data for stress and HRV (since ESP32 only provides temperature)
      const newStressValue = Math.floor(Math.random() * 100);
        const newHrvValue = 20 + Math.floor(Math.random() * 180);

      setCurrentStress(newStressValue);
        setBodyTemperature(newTempValue);
        setHrvValue(newHrvValue);
      setStressData((prevData) => [...prevData.slice(-9), newStressValue]);
        saveToHistory(newStressValue);

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
          Animated.timing(hrvAnimation, {
            toValue: newHrvValue,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ]).start();

      // Classify stress levels
      if (newStressValue > 70) setStressLevel("High");
      else if (newStressValue > 40) setStressLevel("Moderate");
      else setStressLevel("Normal");
      } catch (error) {
        console.error("Error fetching ESP32 data:", error);
        Alert.alert("Error", "Failed to fetch data from ESP32");
        stopMonitoring();
      }
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

  // Clear interval on component unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  // Modified connectToDevice function
  const connectToDevice = () => {
    setShowIPInput(true);
  };
  const openRelaxationHub = () => {
    console.log("Navigate to Relaxation Hub");
    // Add navigation logic here
  };

  const getStressColor = (value: number): string => {
    if (value > 70) return "#ff5252";
    if (value > 40) return "#ffa726";
    return "#4caf50";
  };

  const getTempColor = (temp: number) => {
    if (temp > 37.5) return "#ff5252"; // Red for high temperature
    if (temp < 36.0) return "#2196f3"; // Blue for low temperature
    if (temp >= 36.0 && temp <= 37.5) {
      // Green to Yellow gradient for normal range
      const normalizedTemp = (temp - 36.0) / (37.5 - 36.0); // 0 to 1
      if (normalizedTemp <= 0.5) {
        return "#4caf50"; // Green for lower normal
      } else {
        return "#ffa726"; // Orange for higher normal
      }
    }
    return "#4caf50"; // Default green
  };

  const getHrvColor = (value: number): string => {
    if (value < 30) return "#ff5252";
    if (value > 150) return "#4caf50";
        return "#ffa726";
  };

  const getHrvPercentage = (hrv: number) => {
    return Math.min(100, Math.max(0, ((hrv - 20) / (200 - 20)) * 100));
  };

  const getStressExercises = (stressLevel: number) => {
    if (stressLevel >= 100) {
      return "• Sprinting (10–30 seconds)\n• Clap Push-Ups\n• Hill Sprints";
    } else if (stressLevel >= 90) {
      return "• Deadlifts (90% of 1-rep max)\n• Squats (90% 1RM)\n• Dumbbell Snatch";
    } else if (stressLevel >= 80) {
      return "• Running (400m repeats)\n• Push-Ups (fast tempo)\n• Cycling Sprints (30s on/30s off)";
    } else if (stressLevel >= 70) {
      return "• Jogging (5K pace)\n• Bodyweight Squats (15–20 reps)\n• Moderate Cycling (hill climbs)";
    } else if (stressLevel >= 60) {
      return "• Brisk Walking (power walk)\n• Swimming (leisurely laps)\n• Yoga Flow (vinyasa)";
    } else if (stressLevel >= 50) {
      return "• Walking (casual pace)\n• Wall Push-Ups\n• Standing Hip Circles";
    } else if (stressLevel >= 40) {
      return "• Leisurely Walking (park stroll)\n• Slow Yoga (yin or restorative)\n• Deep Breathing Drills";
    } else if (stressLevel >= 30) {
      return "• Chair Yoga\n• Static Stretching (hamstrings, quads)\n• Body Scans (mindfulness + stretching)";
    } else if (stressLevel >= 20) {
      return "• Slow Walking (indoor pacing)\n• Mindful Breathing (diaphragmatic breaths)\n• Gentle Eye Exercises";
    } else {
      return "• Deep Breathing (4-7-8 technique)\n• Meditation (guided or silent)\n• Progressive Muscle Relaxation";
    }
  };

  const getTemperatureExercises = (temp: number) => {
    if (temp >= 38.0) {
      return "• Rest in a cool environment\n• Take lukewarm (not cold) bath\n• Use light clothing\n• Stay hydrated with cool water";
    } else if (temp >= 37.5) {
      return "• Light stretching exercises\n• Gentle walking in cool area\n• Deep breathing exercises\n• Stay in ventilated space";
    } else if (temp >= 37.0) {
      return "• Moderate walking\n• Light yoga\n• Tai chi\n• Swimming in temperature-controlled pool";
    } else if (temp >= 36.5) {
      return "• Regular cardio exercises\n• Jogging\n• Cycling\n• Regular workout routine";
    } else if (temp >= 36.0) {
      return "• Brisk walking\n• Dynamic stretching\n• Light aerobics\n• Regular activities";
    } else if (temp >= 35.5) {
      return "• Indoor exercises\n• Warm-up routines\n• Light cardio with proper clothing\n• Gradual intensity increase";
    } else {
      return "• Indoor warm-up exercises\n• Movement in warm environment\n• Gentle stretching with warm clothing\n• Hot yoga (if available)";
    }
  };

  const getAnalysis = (): AnalysisData | null => {
    if (selectedMetric === 'stress') {
      const metrics: MetricAnalysis[] = [
        {
          title: 'Stress Level',
          value: `${currentStress}%`,
          status: stressLevel,
          color: getStressColor(currentStress),
          description: currentStress > 70 
            ? "Your stress level is high. Consider taking a break and practicing relaxation techniques."
            : currentStress > 40
            ? "Your stress level is moderate. Try some deep breathing exercises."
            : "Your stress level is normal. Keep up the good work!",
          recommendations: currentStress > 40 
            ? "• Practice deep breathing\n• Take a short walk\n• Listen to calming music\n• Try meditation\n• Progressive muscle relaxation\n• Guided imagery exercises\n• Yoga or gentle stretching\n• Mindful walking"
            : "• Maintain your current routine\n• Regular exercise\n• Good sleep habits\n• Balanced diet\n• Social connections\n• Regular breaks\n• Hobby time\n• Nature exposure"
        },
        {
          title: 'Body Temperature',
          value: `${bodyTemperature.toFixed(1)}°C`,
          status: bodyTemperature > 37.5 
            ? "High"
            : bodyTemperature < 36 
            ? "Low" 
            : "Normal",
          color: bodyTemperature > 37.5 ? "#ff5252" : bodyTemperature < 36 ? "#ffa726" : "#4caf50",
          description: bodyTemperature > 37.5
            ? "Your body temperature is above normal range. Monitor for other symptoms."
            : bodyTemperature < 36
            ? "Your body temperature is below normal range. Try to warm up."
            : "Your body temperature is within the normal range.",
          recommendations: bodyTemperature > 37.5
            ? "• Rest and hydrate\n• Monitor for other symptoms\n• Consult a doctor if persistent\n• Cool down exercises\n• Light stretching\n• Breathing exercises\n• Stay in shade\n• Wear light clothing"
            : bodyTemperature < 36
            ? "• Warm up gradually\n• Wear warm clothing\n• Have warm beverages\n• Gentle movement\n• Indoor exercises\n• Warm-up stretches\n• Layer clothing\n• Stay active"
            : "• Maintain normal activities\n• Stay hydrated\n• Regular exercise\n• Balanced diet\n• Proper clothing\n• Regular breaks\n• Monitor temperature\n• Stay active"
        },
        {
          title: 'Heart Rate Variability',
          value: `${hrvValue}ms`,
          status: hrvValue < 30 
            ? "Low"
            : hrvValue > 150 
            ? "High" 
            : "Normal",
          color: getHrvColor(hrvValue),
          description: hrvValue < 30
            ? "Your HRV is low, which might indicate stress or fatigue. Consider taking time to rest and recover."
            : hrvValue > 150
            ? "Your HRV is high, indicating good cardiovascular fitness and stress resilience."
            : "Your HRV is within a normal range, indicating good balance between stress and recovery.",
          recommendations: hrvValue < 30
            ? "• Prioritize rest and recovery\n• Practice stress management\n• Improve sleep quality\n• Consider reducing training intensity\n• Breathing exercises\n• Gentle yoga\n• Meditation\n• Progressive relaxation"
            : hrvValue > 150
            ? "• Maintain current lifestyle habits\n• Continue balanced exercise routine\n• Keep up good sleep patterns\n• Regular cardiovascular exercise\n• Strength training\n• Flexibility exercises\n• Balance training\n• Active recovery"
            : "• Maintain regular exercise\n• Practice stress management\n• Ensure adequate sleep\n• Balanced activities\n• Regular breaks\n• Proper hydration\n• Healthy diet\n• Active lifestyle"
        }
      ];

      return {
        title: 'Comprehensive Health Analysis',
        details: metrics
      };
    }

    switch (selectedMetric) {
      case 'temperature':
        return {
          title: 'Body Temperature Analysis',
          status: bodyTemperature > 37.5 
            ? "High"
            : bodyTemperature < 36 
            ? "Low" 
            : "Normal",
          details: bodyTemperature > 37.5
            ? "Your body temperature is above normal range. Monitor for other symptoms."
            : bodyTemperature < 36
            ? "Your body temperature is below normal range. Try to warm up."
            : "Your body temperature is within the normal range.",
          recommendation: bodyTemperature > 37.5
            ? "• Rest and hydrate\n• Monitor for other symptoms\n• Consult a doctor if persistent"
            : bodyTemperature < 36
            ? "• Warm up gradually\n• Wear warm clothing\n• Have warm beverages"
            : "• Maintain normal activities\n• Stay hydrated"
        };
      case 'hrv':
        return {
          title: 'Heart Rate Variability Analysis',
          status: hrvValue < 30 
            ? "Low"
            : hrvValue > 150 
            ? "High" 
            : "Normal",
          details: hrvValue < 30
            ? "Your HRV is low, which might indicate stress or fatigue. Consider taking time to rest and recover."
            : hrvValue > 150
            ? "Your HRV is high, indicating good cardiovascular fitness and stress resilience."
            : "Your HRV is within a normal range, indicating good balance between stress and recovery.",
          recommendation: hrvValue < 30
            ? "• Prioritize rest and recovery\n• Practice stress management\n• Improve sleep quality\n• Consider reducing training intensity"
            : hrvValue > 150
            ? "• Maintain current lifestyle habits\n• Continue balanced exercise routine\n• Keep up good sleep patterns"
            : "• Maintain regular exercise\n• Practice stress management\n• Ensure adequate sleep"
        };
      default:
        return null;
    }
  };

  const renderAnalysisModal = () => {
    const analysis = getAnalysis();
    if (!analysis) return null;

    const isComprehensiveAnalysis = selectedMetric === 'stress' && Array.isArray(analysis.details);
    const metrics = isComprehensiveAnalysis ? analysis.details as MetricAnalysis[] : [];

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
              {isComprehensiveAnalysis ? (
                <View style={styles.comprehensiveAnalysisContainer}>
                  {metrics.map((metric: MetricAnalysis, index: number) => (
                    <View key={index} style={styles.metricAnalysisContainer}>
                      <View style={styles.metricHeader}>
                        <Text style={styles.metricTitle}>{metric.title}</Text>
                        <Text style={[styles.metricValue, { color: metric.color }]}>
                          {metric.value}
                        </Text>
                      </View>
                      <Text style={styles.metricStatus}>
                        Status: <Text style={{ color: metric.color }}>{metric.status}</Text>
                      </Text>
                      <Text style={styles.metricDescription}>{metric.description}</Text>
                      <Text style={styles.recommendationTitle}>Recommended Activities:</Text>
                      <Text style={styles.recommendationText}>{metric.recommendations}</Text>
                      {index < metrics.length - 1 && (
                        <View style={styles.metricSeparator} />
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.analysisContainer}>
                  <Text style={styles.statusText}>
                    Status:{" "}
                    <Text style={{ color: getStressColor(currentStress) }}>
                      {analysis.status}
                    </Text>
                  </Text>
                  <Text style={styles.detailsText}>
                    {typeof analysis.details === 'string' ? analysis.details : ''}
                  </Text>
                  <Text style={styles.recommendationTitle}>Recommended Activities:</Text>
                  <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render IP input modal
  const renderIPInputModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showIPInput}
      onRequestClose={() => setShowIPInput(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Connect to ESP32</Text>
            <TouchableOpacity
              onPress={() => setShowIPInput(false)}
              style={styles.closeButton}
            >
              <FontAwesome6 name="xmark" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.ipInput}
            placeholder="Enter ESP32 IP address"
            onSubmitEditing={(e) => connectToESP32(e.nativeEvent.text)}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.ipInstructions}>
            Enter the IP address shown in your ESP32's Serial Monitor
          </Text>
        </View>
      </View>
    </Modal>
  );

  // Add history view to the dashboard
  const renderHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>Recent Measurements</Text>
      {history.length === 0 ? (
        <View style={styles.emptyHistoryContainer}>
          <FontAwesome6 name="history" size={40} color="#ccc" style={styles.emptyHistoryIcon} />
          <Text style={styles.emptyHistoryText}>No measurements recorded yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.historyScrollView}>
          {history.slice().reverse().map((entry, index) => (
            <View key={index} style={styles.historyEntry}>
              <Text style={styles.historyName}>{entry.name}</Text>
              <Text style={styles.historyTime}>{entry.timestamp}</Text>
              <Text style={[styles.historyStress, { color: getStressColor(entry.stressLevel) }]}>
                Stress: {entry.stressLevel}%
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (!isStarted) {
    return <UserInputScreen onStart={handleStartMonitoring} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CalmPulse-Smart Stress Tracker and Guide</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isConnected ? "Connected to ESP32" : "Connect to ESP32"}
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

        <View style={styles.metricsContainer}>
          <TouchableOpacity 
            style={styles.mainMetric}
            onPress={() => {
              setSelectedMetric('stress');
              setShowAnalysis(true);
            }}
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

          <View style={styles.sideMetricsContainer}>
            <View style={styles.sideMetric}>
              <AnimatedCircularProgress
                size={100}
                width={10}
                fill={((bodyTemperature - 35) / (40 - 35)) * 100}
                tintColor={getTempColor(bodyTemperature)}
                backgroundColor="#e0e0e0"
                rotation={0}
                lineCap="round"
              >
                {(fill) => (
                  <View style={styles.smallProgressContent}>
                    <Text style={[
                      styles.smallPercentText,
                      {
                        fontSize: bodyTemperature > 37.5 ? 24 :
                                 bodyTemperature < 36.0 ? 14 : 18,
                        fontWeight: 'bold',
                      }
                    ]}>{`${bodyTemperature.toFixed(1)}°C`}</Text>
                    <FontAwesome6 
                      name="temperature-three-quarters" 
                      size={24} 
                      color={getTempColor(bodyTemperature)}
                      style={styles.iconStyle}
                    />
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>

            <View style={styles.sideMetric}>
              <AnimatedCircularProgress
                size={100}
                width={10}
                fill={getHrvPercentage(hrvValue)}
                tintColor={getHrvColor(hrvValue)}
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
                      color={getHrvColor(hrvValue)}
                      style={styles.iconStyle}
                    />
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <FontAwesome6 
              name="circle-info" 
              size={16} 
              color="#666" 
              style={styles.noteIcon}
            />
            <Text style={styles.noteText}>
              Note: Please take 10 minutes rest if you have been through an exercise such as walking for accurate measurements.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.relaxButton}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Text style={styles.relaxText}>Recent Measurements</Text>
      </TouchableOpacity>

      {showHistory && renderHistory()}
      {renderAnalysisModal()}
      {renderIPInputModal()}
    </ScrollView>
  );
};

export default App;
