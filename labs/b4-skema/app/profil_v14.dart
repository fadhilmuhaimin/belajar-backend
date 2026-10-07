// Lab B4 · model profil di app v1.4 (Dart 3). Field telp wajib ada.
import 'dart:convert';

// --8<-- [start:model]
class Profil {
  final String nama;
  final String telp;
  Profil.fromJson(Map<String, dynamic> j)
      : nama = j['nama'] as String,
        telp = j['telp'] as String; // v1.4 tidak tahu field no_hp
}
// --8<-- [end:model]

void main(List<String> args) {
  final p = Profil.fromJson(jsonDecode(args.first));
  print('app v1.4  layar profil: ${p.nama} · ${p.telp}');
}
