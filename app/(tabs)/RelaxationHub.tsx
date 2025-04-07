import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";

const RelaxationHub: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");

  const openModal = (exercise: string) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relaxation Hub</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => openModal("Breathing Exercise")}
      >
        <Text style={styles.cardText}>Breathing Exercise</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => openModal("Meditation Guide")}
      >
        <Text style={styles.cardText}>Meditation Guide</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => openModal("Play Calming Music")}
      >
        <Text style={styles.cardText}>Play Calming Music</Text>
      </TouchableOpacity>

      {/* Modal for showing relaxation content */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedExercise}</Text>
            {selectedExercise === "Breathing Exercise" && (
              <Text style={styles.modalText}>
                Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7
                seconds, and exhale slowly for 8 seconds.
              </Text>
            )}
            {selectedExercise === "Meditation Guide" && (
              <Text style={styles.modalText}>
                Close your eyes, focus on your breath, and try a guided
                meditation for 5-10 minutes.
              </Text>
            )}
            {selectedExercise === "Play Calming Music" && (
              <Text style={styles.modalText}>
                Listen to soothing instrumental or nature sounds to relax your
                mind.
              </Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  card: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#4caf50",
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  cardText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#ff5252",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default RelaxationHub;
