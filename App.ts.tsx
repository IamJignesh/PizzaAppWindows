import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, SafeAreaView, View, Pressable, ScrollView } from "react-native";

import { HelloReply, HelloRequest } from './protos/tswebText/greet_pb';
import { GreeterClient } from './protos/tswebText/GreetServiceClientPb';

// import { HelloReply, HelloRequest } from './protos/ts/greet_pb';
// import { GreeterClient } from './protos/ts/GreetServiceClientPb';

function IgniteApp() {
  const [state, setState] = React.useState("Test");
  const [userIndex, setUserIndex] = React.useState(-1);
  const [helloMessages, setHelloMessages] = React.useState<string[]>([]);
  const clientRef = useRef<GreeterClient | null>(null);
  const [streamHello, setStreamHello] = React.useState(false);

  // Initialize the gRPC client once
  if (!clientRef.current) {
    clientRef.current = new GreeterClient('http://localhost:5062');
  }

  const usernames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory', 'Oscar', 'Peggy', 'Romeo', 'Sybil', 'Trent', 'Victor', 'Walter', 'Zoe'];

  let request = new HelloRequest();
  request.setName('World');

  useEffect(() => {
    const client = clientRef.current;
    if (!client) {
      return;
    }

    const request = new HelloRequest();
    request.setName('World');

    const stream = client.sayHelloStream(request);

    stream.on('data', (response: HelloReply) => {
      console.log('data', response);
      setState(`${response.getMessage()} ${response.getTimestamp()}`);
    });

    stream.on('error', (err: any) => {
      console.log('error', err);
    });

    stream.on('status', (status: any) => {
      console.log('status', status);
    });

    stream.on('end', () => {
      console.log('Stream ended');
    });

    return () => {
      stream.cancel();
    };
  }, []);

  useEffect(() => {
    const client = clientRef.current;

    if (!client) {
      return;
    }

    const result = usernames.join(',');

    console.log('Selected names:', result);
    const request = new HelloRequest();
    request.setName(result);

    const stream = client.sayHelloToMany(request);

    stream.on('data', (response: HelloReply) => {
      setHelloMessages((prev) => [...prev, `${response.getMessage()} ${response.getTimestamp()}`]);
    });

    stream.on('error', (err: any) => {
      console.log('error', err);
    });

    stream.on('status', (status: any) => {
      console.log('status', status);
    });

    stream.on('end', () => {
      console.log('Stream ended');
    });

    return () => {
      stream.cancel();
    };
  }, []);

  const updateUserIndex = () => {
    // generate random number between 0 and length of usernames
    const randomIndex = Math.floor(Math.random() * usernames.length);
    setUserIndex(randomIndex);
  };

  useEffect(() => {
    if (userIndex === -1) {
      return;
    }
    const client = clientRef.current;
    if (!client) {
      return;
    }

    request.setName(usernames[userIndex]);
    
    client.sayHelloTo(request, {}, (_err: any, _response: HelloReply) => {
      if (_err) {
        console.log('Error:', _err);
      }

      if (_response) {
        console.log('Response:', `${_response.getMessage()} ${_response.getTimestamp()}`);
      }
    });
  }, [userIndex]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text style={{color: 'black'}}>TypeScript</Text>
        <Text style={{color: 'black'}}>Stream kept open after response</Text>
        <Text style={{color: 'black'}}>{state}</Text>
        <Pressable style={{ backgroundColor: '#007acc', width: 150, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20 }} onPress={() => updateUserIndex()}>
          <Text style={{ color: 'white' }}>Say Hello To User</Text>
        </Pressable>
        {/* <Pressable style={{ backgroundColor: '#007acc', width: 150, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20 }} onPress={() => sayHelloToMany()}>
          <Text style={{ color: 'white' }}>Say Hello To Many</Text>
        </Pressable> */}
        <Text style={{color: 'black'}}>Stream closes after response</Text>
        <ScrollView>
          {helloMessages.map((message, index) => (
            <Text style={{color: 'black'}} key={index}>{message}</Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    overflow: 'visible',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 250
  },
});

export default IgniteApp
