<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="csrf-token" content="{{ csrf_token() }}"><title>{{ config('tool.title') }}</title>@vite('resources/js/main.ts')</head><body>
<header><a href="/" class="brand"><b>{{ config('tool.number') }}</b>DEBUG / TESTING</a><div class="row">@auth <small>{{ auth()->user()->name }}</small><form method="post" action="/logout">@csrf<button>Keluar</button></form>@endauth<button id="theme" aria-label="Ganti tema">Gelap</button></div></header>
<main><div class="intro"><div><div class="eyebrow">Debugging & Testing · {{ config('tool.number') }} / 05</div><h1>{{ config('tool.title') }}</h1><p>{{ config('tool.description') }}</p></div><span class="tag">BUKTI SEBELUM KESIMPULAN.</span></div>
@if(session('status'))<div class="status" role="status">{{ session('status') }}</div>@endif
@if($errors->any())<div class="status" role="alert">@foreach($errors->all() as $error)<p>{{ $error }}</p>@endforeach</div>@endif
@yield('content')
<footer class="note"><span>{{ config('tool.title') }} / AhmadNurHidayat-23</span><span>Ruang kerja developer.</span></footer></main></body></html>
