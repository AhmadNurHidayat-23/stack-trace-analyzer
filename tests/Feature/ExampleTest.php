<?php
namespace Tests\Feature;
use Tests\TestCase;
class ExampleTest extends TestCase{public function test_analyzer_is_available():void{$this->get('/')->assertOk()->assertSee('Stack Trace Analyzer');}}
