import React from 'react';
import Geolocation from '@react-native-community/geolocation';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Image,
} from 'react-native';
import MapView, {
  Marker,
  AnimatedRegion,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import haversine from 'haversine';
import MapViewDirections from 'react-native-maps-directions';

// const LATITUDE = 29.95539;
// const LONGITUDE = 78.07513;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 106.78825;
const LONGITUDE = 110.4324;
const GOOGLE_MAPS_APIKEY = 'AIzaSyDW-HnHfDe5d1dIcYjGOPM6dOIfKTj2J-Q';

const MARKER = require('./marker.png');

class AnimatedMarkers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0,
      }),
    };
  }

  componentDidMount() {
    const {coordinate} = this.state;

    this.watchID = Geolocation.watchPosition(
      (position) => {
        const {routeCoordinates, distanceTravelled} = this.state;
        const {latitude, longitude} = position.coords;

        const newCoordinate = {
          latitude,
          longitude,
        };

        if (Platform.OS === 'android') {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              500,
            );
          }
        } else {
          coordinate.timing(newCoordinate, {useNativeDriver: true}).start();
        }

        this.setState({
          latitude,
          longitude,
          heading: position.coords.heading,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate,
          newRegion: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0009,
            longitudeDelta: 0.009,
          },
        });
      },
      (error) => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 100,
      },
    );
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
  }

  calcDistance = (newLatLng) => {
    const {prevLatLng} = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showUserLocation={true}
          // followUserLocation
          // loadingEnabled
          region={this.state.newRegion}>
          {/* <Polyline
            coordinates={this.state.routeCoordinates}
            strokeWidth={5}
            strokeColor={'blue'}
          /> */}
          {/* <MapViewDirections
            origin={this.state.routeCoordinates[0]}
            destination={
              this.state.routeCoordinates[
                this.state.routeCoordinates.length - 1
              ]
            }
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor={'blue'}
            optimizeWaypoints={true}
          /> */}
          <Marker.Animated
            ref={(marker) => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
            flat={true}>
            <Image
              source={MARKER}
              style={[
                styles.marker,
                {
                  transform: [
                    {
                      rotate:
                        this.state.heading === undefined
                          ? '0deg'
                          : `${this.state.heading}deg`,
                    },
                    // {translateX: -20},
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </Marker.Animated>
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              {parseFloat(this.state.distanceTravelled).toFixed(2)} km
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  button: {
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  marker: {
    // height: 55,
    // width: 45,
    position: 'absolute',
    zIndex: 999,
    width: 60,
    height: 60,
  },
});

export default AnimatedMarkers;
