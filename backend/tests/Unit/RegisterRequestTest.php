<?php

namespace Tests\Unit;

use App\Http\Requests\RegisterRequest;
use Illuminate\Validation\Rules\Password;
use PHPUnit\Framework\TestCase;

class RegisterRequestTest extends TestCase
{
    public function test_password_policy_requires_a_strong_password_rule(): void
    {
        $rules = (new RegisterRequest())->rules()['password'];
        $policy = array_values(array_filter($rules, fn ($rule) => $rule instanceof Password))[0];
        $reflection = new \ReflectionClass($policy);

        $this->assertContains('max:128', $rules);
        $this->assertContains('confirmed', $rules);
        $this->assertSame(6, $reflection->getProperty('min')->getValue($policy));
        $this->assertTrue($reflection->getProperty('mixedCase')->getValue($policy));
        $this->assertTrue($reflection->getProperty('numbers')->getValue($policy));
        $this->assertTrue($reflection->getProperty('symbols')->getValue($policy));
    }
}
