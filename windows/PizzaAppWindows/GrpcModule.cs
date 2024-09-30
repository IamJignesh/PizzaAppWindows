using ConsoleApp1;
using Grpc.Core;
using Grpc.Net.Client;
using Grpc.Net.Client.Web;
using Microsoft.ReactNative; // Do not remove this using statement
using Microsoft.ReactNative.Managed; // Do not remove this using statement
using System;
using System.Net.Http;

namespace PizzaAppWindows
{
    [Microsoft.ReactNative.Managed.ReactModule]
    public class GrpcModule
    {
        private static readonly GrpcWebHandler GrpcWebHandler = new GrpcWebHandler(GrpcWebMode.GrpcWeb, new HttpClientHandler
        {
            //UseDefaultCredentials = true,
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        });

        private static readonly HttpClient HttpClient = new HttpClient(GrpcWebHandler);

        private static readonly GrpcChannel Channel = GrpcChannel.ForAddress("https://localhost:7087", new GrpcChannelOptions
        {
            HttpClient = HttpClient
        });

        private readonly Greeter.GreeterClient _client = new Greeter.GreeterClient(Channel);

        [ReactEvent("GrpcEventStream")]
        public Action<string> GrpcEventStream { get; set; }

        [Microsoft.ReactNative.Managed.ReactMethod]
        public async void ConnectToStream()
        {
            var response = _client.SayHelloStream(new HelloRequest { Name = "GreeterClient" });
            while (await response.ResponseStream.MoveNext())
            {
                GrpcEventStream?.Invoke($"{response.ResponseStream.Current.Message} {response.ResponseStream.Current.Timestamp}");
            }

        }
    }
}