// Lab E5 · header apa yang dikirim HttpClient Dart secara bawaan?
import 'dart:io';
Future<void> main() async {
  final server = await HttpServer.bind('127.0.0.1', 0);
  server.listen((req) {
    print('Accept-Encoding diterima server: ${req.headers.value('accept-encoding')}');
    req.response..write('ok')..close();
  });
  final c = HttpClient();
  final req = await c.get('127.0.0.1', server.port, '/');
  await (await req.close()).drain();
  print('HttpClient.autoUncompress bawaan: ${c.autoUncompress}');
  c.close();
  await server.close();
}
