using Google.Protobuf.WellKnownTypes;
using Grpc.Core;

namespace GrpcWebDemo.Services
{
    public class GreeterService : Greeter.GreeterBase
    {
        private static readonly List<IServerStreamWriter<HelloReply>> Streams = [];

        public override async Task<HelloReply> SayHelloTo(HelloRequest request, ServerCallContext context)
        {
            var name = request.Name;
            var response = new HelloReply
            {
                Message = "Hello " + name,
                Timestamp = Timestamp.FromDateTime(DateTime.UtcNow).ToString()
            };

            foreach (var responseStream in Streams)
            {
                await responseStream.WriteAsync(response);
            }

            return await Task.FromResult(new HelloReply
            {
                Message = "OK"
            });
        }

        public override async Task SayHelloToMany(HelloRequest request, IServerStreamWriter<HelloReply> responseStream, ServerCallContext context)
        {
            var names = request.Name.Split(',');

            foreach (var name in names)
            {
                await responseStream.WriteAsync(new HelloReply
                {
                    Message = "Hello " + name,
                    Timestamp = Timestamp.FromDateTime(DateTime.UtcNow).ToString()
                });
            }
        }

        public override async Task SayHelloStream(HelloRequest request, IServerStreamWriter<HelloReply> responseStream, ServerCallContext context)
        {
            Streams.Add(responseStream);
            await responseStream.WriteAsync(new HelloReply
            {
                Message = "Hello " + request.Name,
                Timestamp = Timestamp.FromDateTime(DateTime.UtcNow).ToString()
            });

            await responseStream.WriteAsync(new HelloReply
            {
                Message = "Hello " + request.Name,
                Timestamp = Timestamp.FromDateTime(DateTime.UtcNow).ToString()
            });

            try
            {
                await Task.Delay(-1, context.CancellationToken);
            }
            catch (TaskCanceledException)
            {
                Streams.Remove(responseStream);
            }
        }
    }
}
