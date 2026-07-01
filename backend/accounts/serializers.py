from rest_framework import serializers

from .models import User


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='pk', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role', 'avatar')
        read_only_fields = ('id', 'email')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('name', 'email', 'password')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        name = validated_data.get('name', '')
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            name=name,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].lower()
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'Invalid credentials.'}) from None
        if not user.check_password(attrs['password']):
            raise serializers.ValidationError({'email': 'Invalid credentials.'})
        attrs['user'] = user
        return attrs
