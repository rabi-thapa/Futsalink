import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReviewScreen = ({ route, navigation }) => {
  const { venueId, venueName } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const fetchReviews = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`http://10.0.2.2:3000/api/venue/${venueId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setReviews(data.reviews || []);
    const parsedToken = JSON.parse(atob(token.split('.')[1]));
    setUserId(parsedToken._id);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const submitEditReview = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`http://10.0.2.2:3000/api/review/${selectedReviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating: editRating,
        comment: editComment,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('Review updated!');
      setModalVisible(false);
      fetchReviews();
    } else {
      alert(data.message || 'Error updating review');
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`http://10.0.2.2:3000/api/venue/${venueId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('Review submitted!');
      setRating(0);
      setComment('');
      fetchReviews();
      navigation.goBack();
    } else {
      alert(data.message || 'Error submitting review');
    }
  };

  const handleDelete = async (reviewId) => {
    const token = await AsyncStorage.getItem('accessToken');
    await fetch(`http://10.0.2.2:3000/api/review/${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReviews();
  };

  // Helper function to render stars for selection
  const renderStarsForSelection = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <MaterialCommunityIcons
            name={i <= rating ? 'star' : 'star-outline'}
            size={30}
            color={i <= rating ? '#FFD700' : '#ccc'}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  // Helper function to render stars for display
  const renderStarsForDisplay = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={20}
          color={i <= rating ? '#FFD700' : '#ccc'}
        />
      );
    }
    return stars;
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: `http://10.0.2.2:3000/${item.user.profileImage}` }}
          style={styles.avatar}
        />
        <View style={styles.reviewerDetails}>
          <Text style={styles.reviewerName}>
            {item.user.firstName} {item.user.lastName}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStarsForDisplay(item.rating)}
          </View>
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      {item.user._id === userId && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionBtn, { backgroundColor: '#2196f3' }]}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReview}
        refreshing={refreshing}
        onRefresh={fetchReviews}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>Review for {venueName}</Text>
            <Text style={styles.detailDateAndTime}>Select Rating:</Text>
            {renderStarsForSelection()}
            <TextInput
              style={styles.input}
              placeholder="Your comment"
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <Button title="Submit Review" onPress={submitReview} />
            <View style={{ marginTop: 20 }} />
          </>
        }
      />
      <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Edit Your Review</Text>
            <Text style={styles.detailDateAndTime}>Select Rating:</Text>
            <View style={styles.starContainer}>
              {Array.from({ length: 5 }).map((_, index) => (
                <TouchableOpacity key={index + 1} onPress={() => setEditRating(index + 1)}>
                  <MaterialCommunityIcons
                    name={index + 1 <= editRating ? 'star' : 'star-outline'}
                    size={30}
                    color={index + 1 <= editRating ? '#FFD700' : '#ccc'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Comment"
              value={editComment}
              onChangeText={setEditComment}
              multiline
            />
            <Button title="Save Changes" onPress={submitEditReview} />
            <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewerDetails: {
    alignItems: 'flex-start',
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 7,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: '#ff5252',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalHeading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginLeft: 10, 
  },
});


