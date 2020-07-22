require 'active_model_serializers'
require 'oj'
Oj.optimize_rails

ActiveSupport::Notifications.unsubscribe(ActiveModelSerializers::Logging::RENDER_EVENT)

class Model < ActiveModelSerializers::Model
  derive_attributes_from_names_and_fix_accessors

  attr_writer :id

  # At this time, just for organization of intent
  class_attribute :association_names
  self.association_names = []

  def self.associations(*names)
    self.association_names |= names.map(&:to_sym)
    # Silence redefinition of methods warnings
    ActiveModelSerializers.silence_warnings do
      attr_accessor(*names)
    end
  end

  def associations
    association_names.each_with_object({}) do |association_name, result|
      result[association_name] = public_send(association_name).freeze
    end.with_indifferent_access.freeze
  end

  def attributes
    super.except(*association_names)
  end
end

class ArticleResource < Model
  attributes :title, :body, :date
  associations :author, :references, :comments
end

class CommentResource < Model
  attributes :email, :body, :date
  associations :author
end

class AuthorResource < Model
  attributes :name, :birthyear, :bio
end

class ReferenceResource < Model
  attributes :name, :url
end

article = ArticleResource.new({
  author: AuthorResource.new({
    name: $author.name,
    birthyear: $author.birthyear,
    bio: $author.bio
  }),
  title: "Profiling Jbuilder",
  body: "How to profile Jbuilder",
  date: $now,
  references: $arr.map{|ref| ReferenceResource.new({
    name: "Introduction to profiling",
    url: "http://example.com",
  })},
  comments: $arr.map{|comment|
    CommentResource.new({
      author: AuthorResource.new({
        name: $author.name,
        birthyear: $author.birthyear,
        bio: $author.bio,
      }),
      email: "rolf@example.com",
      body: "Great article",
      date: $now,
    })
  }
})


class AuthorSerializer < ActiveModel::Serializer
  attributes :name, :birthyear, :bio
end

class ReferenceSerializer < ActiveModel::Serializer
  attributes :name, :url
end

class CommentSerializer < ActiveModel::Serializer
  attributes :email, :body, :date
  has_one :author, serializer: AuthorSerializer
end

class ArticleSerializer < ActiveModel::Serializer
  attributes :title, :body, :date
  has_one :author, serializer: AuthorSerializer
  has_many :comments, serializer: CommentSerializer
  has_many :references, serializer: ReferenceSerializer
end

ARTICLE = article

__SETUP__

ActiveModelSerializers::SerializableResource.new(
  ARTICLE, adapter: :json, serializer: ArticleSerializer
).to_json

